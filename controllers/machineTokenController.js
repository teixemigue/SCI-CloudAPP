const { User } = require('../models/user');
const { Confirmation } = require('../models/confirmation');
const { Request } = require('../models/request');
const { Token } = require('../models/token');
const { Establishment} = require('../models/establishment');
const { response } = require('express');



const getUserConfirmations = async (req, res) => {
    try {
        const { userId } = req.params; 
        const confirmations = await Confirmation.findAll({
            where: { userId }
        });
        res.status(200).json(confirmations);
    } catch (error) {
        console.error('Error fetching user confirmations:', error);
        res.status(500).json({ error: 'Failed to fetch user confirmations' });
    }
};


const checkRequestStatus = async (req, res) => {
    const { requestId } = req.params; // Assuming these are passed as URL parameters
  

    console.log("hardware checkign status")
    try {
      const request = await Request.findOne(

        {
            where: {id:requestId}
        }
      );

      if(!request)
      {
        console.log("request not found")
        return res.status(400).json({ error: "Request not found" });
      }else{
        console.log("sending status of a request")
        return res.status(200).json({status:request.status });
      }
    } catch (error) {
      console.error('Error checking confirmation:', error);
      res.status(500).json({ error: 'Failed to check confirmation' });
    }
};


const handleToken = async (req, res) => {
    const { tokenId } = req.params;

    try {
        if (!tokenId) {
            console.log("Token not sent")
            return res.status(400).json({ error: "Token ID is required" });
        }

        // Check if the token exists
        const token = await Token.findOne({
            where: { id: tokenId }
        });
        console.log("token",token)
        if (!token) {
            console.log("token not found")
            return res.status(404).json({ valid: false, message: "Token invalid" });
        }

        if(token.dataValues.status == "Used"){
            return res.status(500).json({ valid: false, message: "Token used" });
        }

        const userId = token.dataValues.UserId;
        // Check if a request for this userId and tokenId already exists
        const existingRequest = await Request.findOne({
            where: {
                tokenId: tokenId,
                userId: userId,
            }
        });

        if (existingRequest) {
            console.log("request already exists")
            return res.status(409).json({
                error: "A pending request already exists for this user and token",
                requestId: existingRequest.id
            });
        }



        const estabishmentId = token.dataValues.EstablishmentId;

        console.log("establishmentId:",estabishmentId)
        const establishment = await Establishment.findOne({
            where:{
                id: estabishmentId
            }

        });

        const confirmations = await Confirmation.bulkCreate([
            {
                establishmentName: establishment.name,
                tokenId:token.id,
                userId:userId,
                usedAt:null
            }

        ]);

        console.log("confirmation created")
        console.log("confirmation:",confirmations)

        // Save the new request in the database
        const requests = await Request.bulkCreate([
            {
                status: 'pending',
                tokenId: tokenId,
                userId: userId
            }
        ]);

        const requestId = requests[0].id;
        console.log("request created")
        console.log("request",requests)


        console.log("sent response waiting user")
        return res.status(200).send(requestId);


    } catch (error) {
        console.error("Error handling token request:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


const handleConfirmation = async (req, res) => {
    const { confirmationId, responseBinary } = req.body;

    if(responseBinary == null){
        return res.status(600).json({message: "Invalid response binary" });

    }

    if(!confirmationId){
        return res.status(404).json({ message: "Invalid ID" });
    }

    let confirmation;
    let request;

    try {
        confirmation = await Confirmation.findOne({
            where: { id: confirmationId }
        });
    } catch (error) {
        console.error('Error fetching confirmation:', error);
        return res.status(500).json({ error: 'Failed to fetch confirmation' });
    }
    
    console.log("confirmation:",confirmation)

    const tokenId = confirmation.dataValues.tokenId;

    const token = await Token.findOne({
        where: { id: tokenId }
    });

    if(token.dataValues.status == "Used"){
        return res.status(201).json({ error: 'Token already used' });
    }
    
    try {
        request = await Request.findOne({
            where: { tokenId: tokenId }
        });
    } catch (error) {
        console.error('Error fetching request:', error);
        return res.status(500).json({ error: 'Failed to fetch request' });
    }

    console.log("request:", request);
    let message;
    // Update the request status based on responseBinary
    if (responseBinary === 1) {
        // Set status to "Approved" (or another appropriate value)
        await request.update({ status: 'Approved' });
        
        await token.update({status:"Used"});
        console.log(`Request with tokenId ${tokenId} updated to 'Approved'.`);
        message = "Successfully confirmed";
    } else if (responseBinary === 0) {
        // Set status to "Rejected" (or another appropriate value)
        await request.update({ status: 'Rejected' });
        console.log(`Request with tokenId ${tokenId} updated to 'Rejected'.`);
        message = "Successfully rejected";
    }

    // Delete the confirmation
    await Confirmation.destroy({
        where: { id: confirmationId }
    });

    console.log("confiramtion deleted")
    return res.status(200).json({message: message });


}

module.exports = { getUserConfirmations, checkRequestStatus, handleToken, handleConfirmation};
