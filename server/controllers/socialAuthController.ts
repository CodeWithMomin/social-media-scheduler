import {Response } from "express";
import zernio from "../config/zernio.js";
import { User } from "../models/User.js";

import { Account } from "../models/Accounts.js";
import { AuthRequest } from "../middleware/authMiddleware.js";


// Helper to insure user has  zernio profile

const getOrCreateZernioProfile=async (user:any):Promise<string> =>{
    try {
        if (user.zernioProfileId) {
            return user.zernioProfileId;
        }
        const result=await zernio.profiles.listProfiles();
        const data=result.data as any;
        const profiles:any[] = Array.isArray(data) ? data :data?.profiles || data?.data || []
        if (profiles.length > 0){
            const pid=profiles[0]._id || profiles[0].id
            await User.findByIdAndUpdate(user._id,{zernioProfileId:pid})
            return pid;
        }
        const createResult=await zernio.profiles.createProfile({
            body:{name:`${user.name || user.email}'s workspace`} as any,
        })
        const created =(createResult.data as any)?.profile || createResult.data;
        const pid=created?._id || created?.id
        if (!pid){
            throw new Error("Failed to create zernio profile - no ID returned")
        }
        await User.findByIdAndUpdate(user._id,{zernioProfileId:pid})
        return pid;
    } catch (error:any) {
        console.error("getOrCreateZernioProfileError",error?.message || error)
        throw error;
    }
}

// genrate OAuth authorization Url
//  GET /api/auth/:platform



export const generateAuthUrl=async (req:AuthRequest,res:Response): Promise<void>=>{
    try {
        const {platform}=req.params;
        const profileId=await getOrCreateZernioProfile(req.user)
        const origin=req.headers.origin;
        const redirectUrl=`${origin}/accounts`
        const result=await zernio.connect.getConnectUrl({
            path:{platform: platform as any},
            query:{
                profileId,
               redirectUrl
            }
        })
        const data=result.data as any
        console.log("getConnectedUrl response",JSON.stringify(data,null,2))
        const authUrl=data.authUrl;
        if(!authUrl){
            throw new Error(`zernio returned no authUrl. Full response: ${JSON.stringify(data)} `)
        }
        res.json({url:authUrl})
    } catch (error:any) {
        console.log(error)
        res.status(500).json({message:error?.message || "Server Error"})
    }
}


// Sync connected accounts from Zernio  into MongoDb
//  GET /api/auth/sync

export const syncAccounts=async (req:AuthRequest,res:Response): Promise<void>=>{
    try {
        const profileId=await getOrCreateZernioProfile(req.user);
        const result =await zernio.accounts.listAccounts({
            query:{profileId} as any
        })
        const data=result.data as any
        const zernioAccounts: any[]=data?.accounts || (Array.isArray(data) ? data :[])
        const supportedPlatforms=["twitter","linkedin","facebook","instagram"];
        const syncedAccounts: any[] = [];
        for ( const zAccount of zernioAccounts){
            const zid=zAccount._id || zAccount.id;
            if(!zid){
                console.warn("Skipping account with no Id:",zAccount)
                continue;
            }
            const rawPlatform =(zAccount.platform || zAccount.type || "").toLowerCase()
            const normalizedPlatform=supportedPlatforms.find((p)=>rawPlatform.includes(p));
            if(!normalizedPlatform){
                console.warn(`Skipping unsupported platform: ${rawPlatform}`)
                continue;
            }
            const account=await Account.findOneAndUpdate({zernioAccountId:zid},
                {
                    user:req.user._id,
                    platform:normalizedPlatform,
                    handle:zAccount.username || zAccount.name || zAccount.handle || "unknown",
                    zernioAccountId:zid,
                    status:"connected",
                    avatarUrl:zAccount.avatarUrl || zAccount.picture || zAccount.profile_image_url
                },
                {
                    upsert:true,returnDocument:'after'
                }
            )
            syncedAccounts.push(account)
        }
        res.json(syncedAccounts)
    } catch (error:any) {
         console.error("Sync accounts error:", error);

    res.status(500).json({
        message: error?.message || "Server Error"
    });
    }
}