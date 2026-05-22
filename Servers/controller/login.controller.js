const jwt = require('jsonwebtoken');

const login = (req, res) =>{
    const {password} = req.body;

    if(password == 1404){
        console.log("The the admin is succsessfully logged in");
        // Generate a secure stateless JWT token valid for 7 days
        const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });
        res.json({success : true , message : "The Admin is successfully Logged-in", token : token});
    }else{
        console.log("The password is incorrect !!");
        res.json({success : false, message : "The password is incorrect"});
    }
}

module.exports = {
    login
};
