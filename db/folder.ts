import { Db } from 'mongodb'
import { nanoid } from 'nanoid'

export const createFolder = async (db: Db, folder: { createdBy: string; name: string }) => {
    return db
        .collection('folders')
        .insertOne({
            _id: nanoid(12),
            ...folder,
            // .toDateString() so that it won't break prop passed down from getServerSideProps()
            createdAt: new Date().toDateString(),
        })
        .then(({ ops }) => ops[0])  // to get the actual folder
}

export const getFolders = async (db: Db, userId: string) => {
    return db
        .collection('folders')
        .find({
            createdBy: userId,
        })
        .toArray()
}