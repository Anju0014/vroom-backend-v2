import mongoose, { Schema, Document, ObjectId } from 'mongoose';

interface IAdmin extends Document {
  _id: ObjectId;
  email: string;
  password: string;
  refreshToken?: string;
}

const AdminSchema = new Schema<IAdmin>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  refreshToken: { type: String },
});

const Admin = mongoose.model<IAdmin>('Admin', AdminSchema);

export { Admin, IAdmin };
