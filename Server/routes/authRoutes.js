const express = require('express');
const router = express.Router();

const { registerUser, loginUser} = require("../controllers/authController");
const protect = require("../middlewares/authMiddleware");

//register new user:
router.post("/register", registerUser);

// login user:
router.post("/login", loginUser);

router.get("/profile", protect, (req,res)=>{
    res.json({
        message: "Protected route working",
        user: req.user
    });
});

module.exports = router;