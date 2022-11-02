import express from "express";
import { createSessionHandler } from "../controller/auth.controller";
import validateResource from "../middleware/validate-resource";
import { createSessionSchema } from "../schema/auth.schema";

const router = express.Router();

router.post(
  "/api/sessions",
  validateResource(createSessionSchema),
  createSessionHandler
);

export default router;
