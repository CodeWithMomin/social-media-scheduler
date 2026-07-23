import express from 'express'
import { getActivity } from '../controllers/activityController.js'

const activityRouter=express.Router()

activityRouter.get('/',getActivity)

export default activityRouter