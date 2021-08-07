import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoMock: MongoMemoryServer;

/**
 * Creates a connection to the local memory database
 */
export const connect = async () => {
	mongoMock = await MongoMemoryServer.create()
	const uri = mongoMock.getUri();
	await mongoose.connect(uri, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});
}

/**
 * Disconnects from the local memory database
 */
export const close = async () => {
	//await mongoose.connection.dropDatabase();
	await mongoose.connection.close();
	await mongoMock.stop();
}

/**
 * Clears the whole local memory database
 */
export const clear = async () => {
	const collections = mongoose.connection.collections;
	for (const key in collections) {
		await collections[key].deleteMany({});
	}
}