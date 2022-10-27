import { prop, getModelForClass } from "@typegoose/typegoose";
import { Severity } from "@typegoose/typegoose/lib/internal/constants";
import { modelOptions } from "@typegoose/typegoose/lib/modelOptions";
import { nanoid } from "nanoid";

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class User {
  @prop({
    lowercase: true,
    required: true,
    unique: true,
  })
  email: string;

  @prop({ required: true })
  firstName: string;

  @prop({ required: true })
  lastName: string;

  @prop({ required: true })
  password: string;

  @prop({ required: true, default: () => nanoid() })
  verificationCode: string;

  @prop()
  passwordResetCode: string | null;

  @prop({ default: false })
  verified: boolean;
}

const UserModel = getModelForClass(User);
export default UserModel;
