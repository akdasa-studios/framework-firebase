import {
  Aggregate, AnyIdentity, Expression, Identity, LogicalOperators, Operators,
  Predicate, Query, Repository, Result
} from '@akdasa-studios/framework'
import {
  collection, CollectionReference, deleteDoc, doc, Firestore,
  getDoc, getDocs, getFirestore, query as fbQuery, QueryConstraint,
  setDoc, where, WhereFilterOp
} from 'firebase/firestore'

export interface ObjectMapper<TSourceType, TDestionationType> {
  map(from: TSourceType): Result<TDestionationType, string>
}

export class FirebaseRepository<
  TAggregate extends Aggregate<AnyIdentity>
> implements Repository<TAggregate> {

  private _db: Firestore
  private _collection: CollectionReference
  private _serializer: ObjectMapper<TAggregate, unknown>
  private _deserializer: ObjectMapper<unknown, TAggregate>

  constructor(
    collectionName: string,
    serializer: ObjectMapper<TAggregate, unknown>,
    deserializer: ObjectMapper<unknown, TAggregate>
  ) {
    this._db = getFirestore()
    this._collection = collection(this._db, collectionName)
    this._serializer = serializer
    this._deserializer = deserializer
  }

  async all(): Promise<Result<readonly TAggregate[]>> {
    const querySnapshot = await getDocs(this._collection)

    const result: TAggregate[] = []
    for (const doc of querySnapshot.docs) {
      const mappingResult = this._deserializer.map(doc.data())
      if (mappingResult.isFailure) {
        return Result.fail('Unable to deserialize object: ' + mappingResult.error)
      }
      result.push(mappingResult.value)
    }

    return Result.ok(result)
  }

  async save(entity: TAggregate): Promise<Result<void, string>> {
    try {
      const mappingResult = this._serializer.map(entity)
      if (mappingResult.isFailure) {
        return Result.fail('Serialization error: ' + mappingResult.error)
      }

      setDoc(
        doc(this._collection, entity.id.value),
        mappingResult.value
      )

      return Result.ok()
    } catch {
      return Result.fail('Error')
    }
  }

  async get(id: TAggregate['id']): Promise<Result<TAggregate, string>> {
    const result = await getDoc(
      doc(this._collection, id.value)
    )
    if (result.exists()) {
      const mappingResult = this._deserializer.map(result.data())
      if (mappingResult.isFailure) {
        return Result.fail('Unable to deserialize object: ' + mappingResult.error)
      }
      return Result.ok(mappingResult.value)
    } else {
      return Result.fail('Does not exist')
    }
  }

  async exists(id: TAggregate['id']): Promise<boolean> {
    const result = await getDoc(
      doc(this._collection, id.value)
    )
    return result.exists()
  }

  async find(query: Query<TAggregate>): Promise<Result<TAggregate[], string>> {
    const convertedFilter = new QueryConverter().convert(query)

    const firebaseQuery = fbQuery(
      this._collection,
      ...convertedFilter
      // where(query.field, operatorsMap[query.operator], query.value)
    )

    const result: TAggregate[] = []
    const querySnapshot = await getDocs(firebaseQuery)
    for (const doc of querySnapshot.docs) {
      const mappingResult = this._deserializer.map(doc.data())
      if (mappingResult.isFailure) {
        return Result.fail('Unable to deserialize object: ' + mappingResult.error)
      }
      result.push(mappingResult.value)
    }
    return Result.ok(result)
  }

  async delete(id: TAggregate['id']): Promise<Result<void, string>> {
    const docId = doc(this._collection, id.value)
    try {
      await deleteDoc(docId)
    } catch {
      return Result.fail('failed')
    }
    return Result.ok()
  }
}

class QueryConverter {
  private operatorsMap: { [name: string]: WhereFilterOp } = {
    [Operators.Equal]: '==',
    [Operators.GreaterThan]: '>',
    [Operators.GreaterThanOrEqual]: '>=',
    [Operators.LessThan]: '<',
    [Operators.LessThanOrEqual]: '<=',
  }

  convert(query: Query<any>): QueryConstraint[] {
    return this._visit(query)
  }

  _visit(query: Query<any>): QueryConstraint[] {
    let result: QueryConstraint[] = []

    if (query instanceof Predicate) {
      return [
        where(
          query.field,
          this.operatorsMap[query.operator],
          this.getValue(query.value)
        )]
    } else if (query instanceof Expression) {
      if (query.operator !== LogicalOperators.And) { throw 'not supported query' }

      for (const q of query.query) {
        result = result.concat(this._visit(q))
      }
    }
    return result
  }

  getValue(object: unknown) {
    if (object instanceof Identity) {
      return object.value
    }
    return object
  }
}
