import express from "express";

const router = express.Router();

import {activateUser, changeUserPassword, deleteUser, loadUser, loginUser, logoutUser, registerUser, resetPassword, resetPasswordRequest, updateUser, updateUserProfile, verifyCaptcha} from "../controllers/user.controller";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middlewares";

router.route("/register").post(registerUser); // 👍
router.route("/login").post(loginUser); // 👍
router.route("/activateuser/:activation_token").post(activateUser); // 👍
router.route("/getuser").get(isAuthenticated,loadUser); // 👍
router.route("/logout").get(isAuthenticated,logoutUser); // 👍
router.route("/verifyCaptcha").post(verifyCaptcha); // 👍
router.route("/update-user-profile").post(isAuthenticated,updateUserProfile);
router.route("/reset-password-request").post(isAuthenticated,resetPasswordRequest); // 👍
router.route("/reset-password/:token").post(isAuthenticated,resetPassword); // 👍


// Admin Routes
router.route("/admin/show-all-users").get(isAdmin,loadUser);
router.route("/admin/update-user/:id").post(isAdmin,updateUser);
router.route("/admin/delete-user/:id").post(isAdmin,deleteUser);
router.route("/admin/change-user-password/:id").post(isAdmin,changeUserPassword);

export default router;
