import { Request, Response } from 'express';
import ZoneService from './service';
import { IZoneCreationBody, IZoneUpdateBody } from './types';

export default class ZoneController {
  _service: ZoneService;

  constructor(service: ZoneService) {
    this._service = service;
  }

  getZones = async (req: Request, res: Response) => {
    const query = req.query || {};
    const zones = await this._service.findZones(query as Record<string, unknown>);
    return res.status(200).json({ data: zones });
  };

  getZoneById = async (req: Request, res: Response) => {
    const { zoneId } = req.params;
    const zone = await this._service.findZoneById(zoneId);
    
    if (!zone) {
      return res.status(404).json({ message: 'Zone not found' });
    }
    
    return res.status(200).json({ data: zone });
  };

  createZone = async (req: Request, res: Response) => {
    const body = req.body as IZoneCreationBody;
    const zone = await this._service.createZone(body);
    return res.status(201).json({ data: zone });
  };

  updateZone = async (req: Request, res: Response) => {
    const { zoneId } = req.params;
    const body = req.body as IZoneUpdateBody;
    const zone = await this._service.updateZone(zoneId, body);
    return res.status(200).json({ data: zone });
  };

  deleteZone = async (req: Request, res: Response) => {
    const { zoneId } = req.params;
    await this._service.deleteZone(zoneId);
    return res.status(200).json({ message: 'Zone deleted successfully' });
  };
}