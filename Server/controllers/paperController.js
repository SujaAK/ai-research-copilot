const Paper = require("../models/Paper")

const uploadPaper = async(req, res) => {
    try{
        const { title, fileUrl } = req.body;

        if(!title || !fileUrl) {
            return res.status(400).json({ message: "Title and fileUrl are required"});
        }

        const paper = await Paper.create({
            user: req.user._id,
            title,
            fileUrl,
            fileName: fileUrl.split("/").pop(),
            status: "uploaded",
        });
        res.status(201).json({
            message: "paper uploaded successfully",
        });
    } catch(error) {
        res.status(500).json({ message: error.message });
    }
};

const getPaper = async (req, res) => {
    try{
        const Papers = await Paper.find({ user: req.user._id }).sort({
            createdAt: -1,
        });
        res.json(papers);
    } catch(error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { uploadPaper , getPaper };