import {
  MongoClient,
  ObjectId
  //@ts-ignore
} from "https://deno.land/x/mongo@v0.31.1/mod.ts";


const client = new MongoClient()
//usuario: Augus, password: NebrijaAugus
await client.connect(
  "mongodb+srv://Augus:NebrijaAugus@cluster0.bffv5pw.mongodb.net/?authMechanism=SCRAM-SHA-1",
);

const db = client.database("Cluster0");

//@ts-ignore
import { Application, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";

type Car = {
  id: string,
  matricula: string,
  plazas: number,
  ocupado: boolean
};

type CarSchema = Omit<Car, "id"> & { _id: ObjectId };

const app = new Application();

const router = new Router();
router
  .post("/addCar", async (context) => {
    const result = context.request.body({ type: "json" });
    const value = await result.value;
    if (!value?.matricula || !value?.plazas) {
      context.response.body = "Formato no correcto."
      context.response.status = 400;
      return;
    }
    const checkCar: (CarSchema | undefined) = await db
    .collection<CarSchema>("Cabify")
    .findOne({
      matricula: value.matricula,
    });
    if(!checkCar){
      const car: Partial<Car> = {
        matricula: value.matricula,
        plazas: value.plazas,
        ocupado: false
      };
      const id: (CarSchema | undefined) = await db
        .collection<CarSchema>("Cabify")
        .insertOne(car as CarSchema);
      car.id = id?.toString();
      context.response.body = car;
    }
    else{
      context.response.body = "Coche ya está en la base."
    }
  })
  .delete("/removeCar/:id", async (context) => {
    if (context.params?.id) {
      const checkCar: (CarSchema | undefined) = await db
      .collection<CarSchema>("Cabify")
      .findOne({
        _id: new ObjectId(context.params.id)
      });
      if(!checkCar?.ocupado){
        const count = await db.collection<CarSchema>("Cabify").deleteOne({
          _id: new ObjectId(context.params.id),
        });
        if (count) {
          context.response.body = "Coche borrado con éxito."
          context.response.status = 200;
        } else {
          context.response.status = 404;
        }
      }
      else{
        context.response.body = "Coche no no encontrado u ocupado."
        context.response.status = 405;
      }
    }
  })
  .get("/car/:id", async(context) =>{
    if (context.params?.id) {
      const checkCar: (CarSchema | undefined) = await db
      .collection<CarSchema>("Cabify")
      .findOne({
        _id: new ObjectId(context.params.id)
      });
      if(checkCar){
        const car: Car = {
          id : checkCar._id,
          matricula: checkCar.matricula,
          plazas: checkCar.plazas,
          ocupado: checkCar.ocupado
        }
        context.response.body = car;
      }
      else{
        context.response.body = "Coche no encontrado."
      }
    }
  })
  .put("/askCar", async (context) => {
    const checkCar: (CarSchema | undefined) = await db
      .collection<CarSchema>("Cabify")
      .findOne({
        ocupado: false
      });
    if (checkCar) {
      const car = await db.collection<CarSchema>("Cabify").updateOne(
        { _id: checkCar._id },
        {
          $set: {
            ocupado: true
          },
        }
      );
      context.response.body = checkCar?._id.toString();
    }
    else{
      context.response.body = "No quedan coches libres.";
      context.response.status = 404;
    }
  })
  .put("/releaseCar/:id", async (context) => {
    if (context.params?.id) {
      const checkCar: (CarSchema | undefined) = await db
      .collection<CarSchema>("Cabify")
      .findOne({
        _id: new ObjectId(context.params.id)
      });
      if(checkCar?.ocupado){
        const car = await db.collection<CarSchema>("Cabify").updateOne(
          { _id: new ObjectId(context.params?.id) },
          {
            $set: {
              ocupado: false
            },
          }
        );
        if (car) {
          const car: (CarSchema | undefined) = await db.collection<CarSchema>("Cabify").findOne({
            _id: new ObjectId(context.params.id),
          });
          context.response.body = {
            id: car?._id.toString(),
            matricula: car?.matricula,
            plazas: car?.plazas,
            ocupado: car?.ocupado
          };
          context.response.status = 200;
        } else {
          context.response.status = 404;
        }
      }
      else{
        context.response.body = "Coche no encontrado."
        context.response.status = 400;
      }
    }
  });

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 7777 });
