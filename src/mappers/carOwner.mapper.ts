import { ICarOwner } from '@models/carowner/carOwnerModel';
import { RegisterBasicDTO } from '@dtos/common/registerBasic.dto';
import { CarOwnerDTO } from '@dtos/carOwner/carOwner.dto';
import { CarOwnerVerifyListDTO } from '@dtos/carOwner/carOwnerVerify.dto';
import { CarOwnerPublicDTO } from '@dtos/carOwner/carOwnerPublic.dto';
import { LoginResponseDTO } from '@dtos/common/loginResponse.dto';
import { OwnerProfileDTO, OwnerProfileUpdateDTO } from '@dtos/carOwner/carOwnerProfile.dto';

export class CarOwnerMapper {
  static toBasicRegisterDTO(customer: ICarOwner): RegisterBasicDTO {
    return {
      email: customer.email,
    };
  }

  static toLoginDTO(owner: ICarOwner, accessToken: string): LoginResponseDTO {
    return {
      accessToken,
      user: {
        id: owner._id.toString(),
        fullName: owner.fullName,
        email: owner.email,
        role: owner.role,
        profileImage: owner.profileImage,
      },
    };
  }

  static toDTO(owner: ICarOwner): CarOwnerDTO {
    return {
      id: owner._id.toString(),
      fullName: owner.fullName,
      email: owner.email,
      phoneNumber: owner.phoneNumber,
      altPhoneNumber: owner.altPhoneNumber,
      isVerified: owner.isVerified,
      processStatus: owner.processStatus,
      verifyStatus: owner.verifyStatus,
      blockStatus: owner.blockStatus,
      idVerified: owner.idVerified,
      rejectionReason: owner.rejectionReason,
      profileImage: owner.profileImage,
      createdAt: owner.createdAt,
    };
  }

  static toDTOProfile(owner: ICarOwner): OwnerProfileDTO {
    return {
      id: owner._id.toString(),
      fullName: owner.fullName,
      email: owner.email,
      phoneNumber: owner.phoneNumber,
      altPhoneNumber: owner.altPhoneNumber,
      isVerified: owner.isVerified,
      processStatus: owner.processStatus,
      verifyStatus: owner.verifyStatus,
      blockStatus: owner.blockStatus,
      role: owner.role,

      idVerified: owner.idVerified,
      idProof: owner.idProof,
      rejectionReason: owner.rejectionReason,
      profileImage: owner.profileImage,
      createdAt: owner.createdAt,
      address:
        owner.address && Object.values(owner.address).some(Boolean) ? owner.address : undefined,
    };
  }

  static toDTOUpdateProfile(owner: ICarOwner): OwnerProfileUpdateDTO {
    return {
      id: owner._id.toString(),
      fullName: owner.fullName,
      email: owner.email,
      phoneNumber: owner.phoneNumber,
      isVerified: owner.isVerified,
      profileImage: owner.profileImage,
      role: owner.role,
      address:
        owner.address && Object.values(owner.address).some(Boolean) ? owner.address : undefined,
    };
  }

  static toDTOList(owners: ICarOwner[]): CarOwnerDTO[] {
    return owners.map((owner) => this.toDTO(owner));
  }

  static toVerifyDTO(owner: ICarOwner): CarOwnerVerifyListDTO {
    return {
      id: owner._id.toString(),
      fullName: owner.fullName,
      email: owner.email,
      phoneNumber: owner.phoneNumber,
      processStatus: owner.processStatus,
      verifyStatus: owner.verifyStatus,
      blockStatus: owner.blockStatus,
      idVerified: owner.idVerified,
      createdAt: owner.createdAt,
    };
  }

  static toVerifyDTOList(owners: ICarOwner[]): CarOwnerVerifyListDTO[] {
    return owners.map((owner) => this.toVerifyDTO(owner));
  }

  static toPublicDTO(owner: ICarOwner): CarOwnerPublicDTO {
    return {
      id: owner._id.toString(),
      fullName: owner.fullName,
      email: owner.email,
      phoneNumber: owner.phoneNumber,
      role: owner.role,
      profileImage: owner.profileImage,
      blockStatus: owner.blockStatus,
      processStatus: owner.processStatus,
      createdAt: owner.createdAt,
    };
  }
}
