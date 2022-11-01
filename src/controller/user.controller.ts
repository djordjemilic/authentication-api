import { Request, Response } from "express";
import { CreateUserInput } from "../schema/user.schema";
import { createUser } from "../service/user.service";
import sendEmail from "../utils/mailer";

export async function createUserHandler(
  req: Request<{}, {}, CreateUserInput>,
  res: Response
) {
  const body = req.body;

  try {
    const user = await createUser(body);
    sendEmail({
      from: "djordjemilic33@gmail.com",
      to: user.email,
      subject: "Please verify your account",
      text: `Verification code ${user.verificationCode}. Id: ${user.id}`,
    });

    return res.send("User successfully created");
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).send("Account already exists");
    }

    return res.status(500).send(err);
  }
}
