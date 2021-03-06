import { LocationEvent } from "@/sockets/location";
import { Data } from "@/sockets/location/OnLocationUpdate";
import { SocketTestHelper } from "@test-util/SocketSetUp";

/** Needed mock for socket tests */
jest.mock("@/services/UserService");
jest.mock("@/services/NotificationService");

describe("Updating the location", () => {

	const s = new SocketTestHelper();

	const update: Data = {
		id: "id",
		displayName: "name",
		position: {
			latitude: 0,
			longitude: 1
		}
	}

	beforeAll(s.setUpServer);

	beforeEach(s.setUpClients);

	afterAll(s.close);

	afterEach(s.disconnectClients);

	it("should broadcast the location to the rest of users",
	(done) => {
		s.joinLocation(() => {
			expect.assertions(1);
			s.clientA.on(LocationEvent.UPDATE, (_msg: Data) => {
				fail();	// clientA should not receive it
			});
			s.clientB.on(LocationEvent.UPDATE, (msg: Data) => {
				expect(msg).toEqual(update);
				done();
			});
			s.clientA.emit(LocationEvent.UPDATE, update);
		});
	});

});