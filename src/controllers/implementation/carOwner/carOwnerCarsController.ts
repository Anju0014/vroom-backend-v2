import { Response, Request, NextFunction } from 'express';
import { ICar } from 'models/car/carModel';
import { CustomRequest } from 'middlewares/authMiddleWare';
import { MESSAGES } from 'constants/message';
import { StatusCode } from 'constants/statusCode';

import ICarOwnerCarsController from '@controllers/interfaces/carowner/ICarOwnerCarsController';
import { ICarOwnerCarsService } from '@services/interfaces/carOwner/ICarOwnerCarsServices';
import { CarMapper } from '@mappers/car.mapper';
import { CarListResponseDTO } from '@dtos/car/carList.response.dto';
import logger from '@utils/logger';
import { ApiError } from '@utils/apiError';

class CarOwnerCarsController implements ICarOwnerCarsController {
  private _ownerscarService: ICarOwnerCarsService;

  constructor(_carService: ICarOwnerCarsService) {
    this._ownerscarService = _carService;
  }

  async uploadCar(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        carName,
        brand,
        year,
        fuelType,
        carType,
        rcBookNo,
        expectedWage,
        location,
        images,
        videos,
        rcBookProof,
        insuranceProof,
      } = req.body;
      const ownerId = req.userId;

      if (!ownerId) {
        logger.warn('no owner');
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }

      if (
        !carName ||
        !brand ||
        !expectedWage ||
        !location ||
        !insuranceProof ||
        !rcBookProof ||
        !images ||
        (Array.isArray(images) && images.length === 0)
      ) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.MISSING_FIELDS);
      }
      const geoLocation: ICar['location'] = {
        address: location.address,
        landmark: location.landmark,
        coordinates: {
          type: 'Point',
          coordinates: [location.coordinates.lng, location.coordinates.lat] as [number, number],
        },
      };

      const carData: Partial<ICar> = {
        carName,
        brand,
        year,
        fuelType,
        carType,
        rcBookNo,
        expectedWage,
        rcBookProof,
        insuranceProof,
        location: geoLocation,
        images: Array.isArray(images) ? images : [images],
        videos: videos && Array.isArray(videos) ? videos : [],
      };
      const newCar = await this._ownerscarService.registerNewCar(carData, ownerId);

      const carResponse = CarMapper.toCarDTO(newCar);
      res.status(StatusCode.CREATED).json({
        success: true,
        message: MESSAGES.SUCCESS.CAR_UPLOADED,
        car: carResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCarList(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.userId;
      if (!ownerId) {
        throw new ApiError(StatusCode.UNAUTHORIZED, MESSAGES.ERROR.UNAUTHORIZED);
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 9;
      if (page < 1 || limit < 1 || limit > 100) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.INVALID_PAGE_OR_LIMIT,
        });
        return;
      }
      const cars = await this._ownerscarService.getCarsByOwner(ownerId, page, limit);
      const total = await this._ownerscarService.getCarsCount(ownerId);
      const carDTOs = CarMapper.toCarDTOs(cars);
      const response: CarListResponseDTO = { cars: carDTOs, total };

      res.status(StatusCode.OK).json({ success: true, ...response });
    } catch (error) {
      next(error);
    }
  }

  async getBookingsByCarId(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.userId;
      if (!ownerId) {
        throw new ApiError(StatusCode.UNAUTHORIZED, MESSAGES.ERROR.UNAUTHORIZED);
      }

      const carId = req.params.id;
      if (!carId) {
        throw new ApiError(StatusCode.UNAUTHORIZED, MESSAGES.ERROR.UNAUTHORIZED);
      }

      const bookings = await this._ownerscarService.getBookingsByCarId(carId, ownerId);
      res.status(StatusCode.OK).json({
        success: true,
        message: 'Bookings fetched successfully',
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCarAvailability(
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const ownerId = req.userId;
      if (!ownerId) {
        throw new ApiError(StatusCode.UNAUTHORIZED, MESSAGES.ERROR.UNAUTHORIZED);
      }

      const carId = req.params.id;
      if (!carId) {
        throw new ApiError(StatusCode.UNAUTHORIZED, MESSAGES.ERROR.UNAUTHORIZED);
      }
      const { unavailableDates } = req.body;

      if (!Array.isArray(unavailableDates)) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.NO_UNAVAILABLE_DATES);
      }

      const car = await this._ownerscarService.updateCarAvailability(
        carId,
        ownerId,
        unavailableDates
      );
      const carResponse = CarMapper.toCarDTO(car);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.AVAILABLE_DATES_UPDATED,
        data: carResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCar(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const carId = req.params.id;
      if (!carId) {
        throw new ApiError(StatusCode.UNAUTHORIZED, MESSAGES.ERROR.UNAUTHORIZED);
      }
      const deletedCar = await this._ownerscarService.deleteCar(carId);
      const carResponse = CarMapper.toCarDTO(deletedCar);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.CAR_DELETED || 'Car deleted successfully',
        car: carResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCar(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const carId = req.params.id;
      const ownerId = req.userId;
      const {
        carName,
        brand,
        year,
        fuelType,
        rcBookNo,
        expectedWage,
        location,
        images,
        videos,
        available,
        carType,
        rcBookProof,
        insuranceProof,
      } = req.body;

      if (!ownerId) {
        throw new ApiError(StatusCode.UNAUTHORIZED, MESSAGES.ERROR.UNAUTHORIZED);
      }

      if (
        !carName ||
        !brand ||
        !expectedWage ||
        !location ||
        !images ||
        (Array.isArray(images) && images.length === 0)
      ) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.MISSING_FIELDS);
      }

      const geoLocation: ICar['location'] = {
        address: location.address,
        landmark: location.landmark,
        coordinates: {
          type: 'Point',
          coordinates: [location.coordinates.lng, location.coordinates.lat] as [number, number],
        },
      };

      const updatedCarData: Partial<ICar> = {
        carName,
        brand,
        year,
        fuelType,
        rcBookNo,
        expectedWage,
        available,
        rcBookProof,
        insuranceProof,
        carType,
        location: geoLocation,
        images: Array.isArray(images) ? images : [images],
        videos: videos && Array.isArray(videos) ? videos : [],
      };

      const updatedCar = await this._ownerscarService.updateCar(carId, updatedCarData);

      const carResponse = CarMapper.toCarDTO(updatedCar);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.CAR_UPDATED,
        car: carResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  async getActiveBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { carId } = req.params;
      const booking = await this._ownerscarService.getActiveBookingForCar(carId);
      if (!booking) {
        res.status(StatusCode.OK).json({
          success: true,
          booking: null,
        });
        return;
      }
      const bookingDTOs = CarMapper.toCarBookingDTO(booking);
      res.status(StatusCode.OK).json({ success: true, booking: bookingDTOs });
    } catch (error) {
      next(error);
    }
  }
}

export default CarOwnerCarsController;
