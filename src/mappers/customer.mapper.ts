import { ICustomer } from '@models/customer/customerModel';
import { CustomerDTO, CustomerProfileUpdateDTO } from '@dtos/customer/customer.dto';
import { CustomerAuthDTO } from '@dtos/customer/customerAuth.dto';
import { RegisterBasicDTO } from '@dtos/common/registerBasic.dto';
import { CustomerUpdateDTO } from '@dtos/customer/customerUpdate.dto';
import { LoginResponseDTO } from '@dtos/common/loginResponse.dto';

export class CustomerMapper {
  static toBasicRegisterDTO(customer: ICustomer): RegisterBasicDTO {
    return {
      email: customer.email,
    };
  }

  static toLoginDTO(customer: ICustomer, accessToken: string): LoginResponseDTO {
    return {
      accessToken,
      user: {
        id: customer._id.toString(),
        fullName: customer.fullName,
        email: customer.email,
        role: customer.role,
        profileImage: customer.profileImage,
      },
    };
  }

  static toDTO(customer: ICustomer): CustomerDTO {
    return {
      id: customer._id.toString(),
      fullName: customer.fullName,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      isVerified: customer.isVerified,
      role: customer.role,
      processStatus: customer.processStatus,
      verifyStatus: customer.verifyStatus,
      blockStatus: customer.blockStatus,
      idVerified: customer.idVerified,
      idProof: customer.idProof,
      profileImage: customer.profileImage,
      createdAt: customer.createdAt,
      address:
        customer.address && Object.values(customer.address).some(Boolean)
          ? customer.address
          : undefined,
    };
  }

  static toDTOUpdateProfile(customer: ICustomer): CustomerProfileUpdateDTO {
    return {
      id: customer._id.toString(),
      fullName: customer.fullName,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      isVerified: customer.isVerified,
      profileImage: customer.profileImage,
      role: customer.role,
      address:
        customer.address && Object.values(customer.address).some(Boolean)
          ? customer.address
          : undefined,
    };
  }

  static toDTOList(customers: ICustomer[]): CustomerDTO[] {
    return customers.map((c) => this.toDTO(c));
  }

  static toAuthDTO(customer: ICustomer): CustomerAuthDTO {
    return {
      id: customer._id.toString(),
      fullName: customer.fullName,
      email: customer.email,
      role: customer.role,
      profileImage: customer.profileImage,
    };
  }

  static toUpdateDTO(customer: ICustomer): CustomerUpdateDTO {
    return {
      id: customer._id.toString(),
      fullName: customer.fullName,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      profileImage: customer.profileImage,
    };
  }
}
