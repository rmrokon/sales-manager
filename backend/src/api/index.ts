import {Router} from "express";
import { ROUTES } from "./modules/routes";

export default function Routes (){
    const router = Router();
    Object.keys(ROUTES).forEach(key => router.use(key, ROUTES[key as keyof typeof ROUTES]));
    return router;    
}