import Fastify from "fastify";
import userRouter from "./modules/user/user.route";

const app = Fastify({
  logger: true,
});

//check if the server is running
app.get("/health_check", async function handler(request, reply) {
  reply.status(200).send({ status: "ok" });
});

// Run the server!
const startServer = async () => {
  //declare the routes
  app.register(userRouter, { prefix: "/api/v1/users" });

  try {
    await app.listen(8081, "0.0.0.0");
    console.log(`server listening on port 8081`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

//start the server
startServer();
