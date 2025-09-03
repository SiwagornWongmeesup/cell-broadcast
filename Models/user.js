import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema(
    {
        name:{
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        location: {
           lat: {
               type: Number,
               required: true
           },
           lng: {
               type: Number,
               required: true
           }
        },
        role: {
            type: String,
            required: true,
            enum: ["user", "admin"], // บังคับให้เป็นแค่ "user" หรือ "admin"
            default: "user"//ถ้าไม่ส่งคาจะบังคับเป็นuser
        },
        isVerifield: {
            type: Boolean,
            default: false // ค่าเริ่มต้นเป็น false
        },
        verificationToken: {  
            type: String,
        },
        TokenExpires: {
            type: Date,
        }, 
    },
    {timestamps: true}
)

const User = mongoose.models.User || mongoose.model("User",userSchema);
export default User;