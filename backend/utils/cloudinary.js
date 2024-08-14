import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
cloudinary.config({ 
    cloud_name: 'dycav0fss', 
    api_key: '791472418285574', 
    api_secret: 'xXqON4Piiu5W60NeQ81oKjrcjSg' 
    // Click 'View Credentials' below to copy your API secret
});

export const uploadOnCloudinary = async(localFilePath)=> {

    // Configuration
    try {
        
        if(!localFilePath) return null;
        const response = await cloudinary.uploader.upload(""+localFilePath,{
            resource_type:"auto"
        })
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null
    }
    // Upltoad an image
       
};