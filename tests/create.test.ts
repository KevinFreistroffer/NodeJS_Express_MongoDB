import request from "supertest";
import sinon from "sinon";
import rewire from "rewire";
import mongoose from "mongoose";
let app = rewire("../server");
const sandbox = sinon.createSandbox();

let sampleItemVal = {
  name: "sample item",
  price: 10,
  rating: "5",
  hash: "123456891",
};

test("Test", async () => {
  const findOneStub = sandbox
    .stub(mongoose.Model, "findOne")
    .resolves(sampleItemVal);
}, 15000);
