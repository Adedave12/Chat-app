const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
const UserModel = require("../models/UserModel");

async function updateUserDetails(req, res) {
  try {
    // Get token from Authorization header or cookies
    const authHeader = req.headers.authorization;
    const token = (authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : req.cookies.token) || "";

    const user = await getUserDetailsFromToken(token);

    const { name, profile_pic, bio } = req.body;

    const updateUser = await UserModel.updateOne(
      {
        _id: user._id,
      },
      {
        name,
        profile_pic,
        bio,
      }
    );

    const userInformation = await UserModel.findById(user._id);

    return res.json({
      message: "User details updated successfully",
      data: userInformation,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
    });
  }
}
module.exports = updateUserDetails