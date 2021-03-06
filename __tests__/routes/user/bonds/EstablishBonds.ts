import { Role, UserModel } from "@/models/User";
import { ERR_MSG } from "@/shared/errors";
import * as db from "@test-util/MongoMemory";
import { openSession, postRequest } from "@test-util/SessionSetUp";
import { StatusCodes } from "http-status-codes";
import * as jwt from "jsonwebtoken";
import { msg_bonding_completed } from "@/shared/strings";
import { SessionDto, UserDto } from "@/models/dto";

beforeAll(db.connect);
afterEach(db.clear);
afterAll(db.close);

const endpoint = "/user/bonds/establish";

describe("Calling POST " + endpoint, () => {

	let session: SessionDto;
	let user: UserDto;

	beforeEach((done) => {
		openSession((response) => {
			session = response.session;
			user = response.user;
			if (session && user) {
				done();
			}
		});
	});

	it("should establish the bond if it's correct", async () => {
		await UserModel.findByIdAndUpdate(user._id, {
			role: Role.Keeper
		});
		const patient = await UserModel.create({
			googleId: "patient",
			role: Role.Patient
		});
		const token = jwt.sign(
			{ 
				sessionId : patient._id,
				time: Date.now()
			}, 
			process.env.BOND_TOKEN_SECRET, 
			{ expiresIn: process.env.BOND_TOKEN_EXPIRATION_TIME }
		);

		const response = await postRequest(endpoint, session.auth)
			.send({ code: token })
			.expect(StatusCodes.OK);

		expect(response.body.message).toEqual(msg_bonding_completed);
		const storedPatient = await UserModel.findById(patient._id);
		expect(storedPatient.bonds.length).toBe(1);
		expect(storedPatient.bonds[0].toString()).toMatch(user._id);
		const storedKeeper = await UserModel.findById(user._id);
		expect(storedKeeper.cared).toEqual(patient._id);
	});

	it("should return an error when the token is not valid", async () => {
		const response = await postRequest(endpoint, session.auth)
			.send({ code: "invalid" })
			.expect(StatusCodes.UNAUTHORIZED);
		expect(response.body.message).toBe(ERR_MSG.token_invalid);
	});


});