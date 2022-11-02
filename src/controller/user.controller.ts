import { Request, Response } from "express";
import { nanoid } from "nanoid";
import {
  CreateUserInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyUserInput,
} from "../schema/user.schema";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../service/user.service";
import log from "../utils/logger";
import sendEmail from "../utils/mailer";

// Creating User
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
      text: `Verification code ${user.verificationCode} Id: ${user._id}`,
    });

    return res.send("User successfully created");
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).send("Account already exists");
    }

    return res.status(500).send(err);
  }
}

// Verification
export async function verifyUserHandler(
  req: Request<VerifyUserInput>,
  res: Response
) {
  const id = req.params.id;
  const verificationCode = req.params.verificationCode;

  // Find user by id
  const user = await findUserById(id);

  if (!user) {
    return res.send("Could not verify user");
  }
  // Check if the verificationCode matches
  if (user.verified) {
    return res.send("User is already verified");
  }
  // Check if user is already verified
  if (user.verificationCode === verificationCode) {
    user.verified = true;

    await user.save();
    return res.send("User successfully verified");
  }

  return res.send("Could not verify user");
}

// Requesting password reset
export async function forogotPasswordHandler(
  req: Request<{}, {}, ForgotPasswordInput>,
  res: Response
) {
  const message =
    "If a user with that email is registered you will recieve a password reset email";
  const { email } = req.body;

  const user = await findUserByEmail(email);

  if (!user) {
    log.debug(`User with email ${email} does not exists`);
    return res.send();
  }

  if (!user.verified) {
    return res.send("User is not verified");
  }

  const passwordResetCode = nanoid();
  user.passwordResetCode = passwordResetCode;
  await user.save();

  await sendEmail({
    to: user.email,
    from: "djordjemilic33@gmail.com",
    subject: "Reset your password",
    text: `Password reset code: ${passwordResetCode} Id: ${user._id}`,
  });

  log.debug(`Password reset email sent to ${email}`);

  return res.send(message);
}

export async function resetPasswordHandler(
  req: Request<ResetPasswordInput["params"], {}, ResetPasswordInput["body"]>,
  res: Response
) {
  const { id, passwordResetCode } = req.params;
  const { password } = req.body;

  const user = await findUserById(id);

  if (
    !user ||
    !user.passwordResetCode ||
    user.passwordResetCode !== passwordResetCode
  ) {
    return res.status(400).send("Could not reset user password");
  }

  user.passwordResetCode = null;
  user.password = password;
  await user.save();

  return res.send("Successfully updated password ");
}
