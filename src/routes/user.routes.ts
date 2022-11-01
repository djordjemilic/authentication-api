import express from "express";
import { createUserHandler } from "../controller/user.controller";
import validateResource from "../middleware/validate-resource";
import { createUserSchema } from "../schema/user.schema";

const router = express.Router();

router.post(
  "/api/users",
  validateResource(createUserSchema),
  createUserHandler
);

export default router;
