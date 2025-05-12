import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

@Injectable()
export class FeesService {
  async createFees(payload: any) {
    try {
      const { feeName, feeDescription, policy, feesDetails, feeType, menuId } = payload;

      // Step 1: Validate required fields
      if (!feeName || !feesDetails?.length) {
        return {
          status: false,
          message: "feeName and feesDetails are required.",
          data: [],
        };
      }

      const menuIdExist = await prisma.fees.findFirst({
        where: { menuId: menuId }
      });
      if (menuIdExist) {
        return {
          status: false,
          message: "menu is already associated with other fees",
          data: [],
        };
      }

      // Step 2: Create the main fee record
      const fee = await prisma.fees.create({
        data: {
          feeName,
          feeDescription,
          policyId: policy || null,
          feeType: feeType || 'NONGLOBAL',
          menuId: menuId
        },
      });

      // Step 3: Process each feeDetail (vendor and consumer)
      for (const detail of feesDetails) {
        const { vendorDetails, customerDetails } = detail;

        // Step 3.1: Create vendor fee detail
        let vendorLocationId = null;
        if (!vendorDetails.isGlobal) {
          const vendorLocation = await prisma.feesLocation.create({
            data: {
              feeId: fee.id,
              feeLocationType: 'VENDOR',
              countryId: vendorDetails.location.countryId,
              stateId: vendorDetails.location.stateId,
              cityId: vendorDetails.location.cityId,
              town: vendorDetails.location.town,
            },
          });
          vendorLocationId = vendorLocation.id;
        }

        let vendorDetail = await prisma.feesDetail.create({
          data: {
            feeId: fee.id,
            feesType: "VENDOR",
            vendorPercentage: vendorDetails.vendorPercentage,
            vendorMaxCapPerDeal: vendorDetails.vendorMaxCapPerDeal,
            vendorVat: vendorDetails.vendorVat,
            vendorPaymentGateFee: vendorDetails.vendorPaymentGateFee,
            vendorFixFee: vendorDetails.vendorFixFee,
            vendorMaxCapPerMonth: vendorDetails.vendorMaxCapPerMonth,
            isVendorGlobal: vendorDetails.isGlobal,
            vendorLocationId,
          },
        });

        // Step 3.2: Create consumer fee detail
        let consumerLocationId = null;
        if (!customerDetails.isGlobal) {
          const consumerLocation = await prisma.feesLocation.create({
            data: {
              feeId: fee.id,
              feeLocationType: 'CONSUMER',
              countryId: customerDetails.location.countryId,
              stateId: customerDetails.location.stateId,
              cityId: customerDetails.location.cityId,
              town: customerDetails.location.town,
            },
          });
          consumerLocationId = consumerLocation.id;
        }

        let consumerDetail = await prisma.feesDetail.create({
          data: {
            feeId: fee.id,
            feesType: "CONSUMER",
            consumerPercentage: customerDetails.consumerPercentage,
            consumerMaxCapPerDeal: customerDetails.consumerMaxCapPerDeal,
            consumerVat: customerDetails.consumerVat,
            consumerPaymentGateFee: customerDetails.consumerPaymentGateFee,
            consumerFixFee: customerDetails.consumerFixFee,
            consumerMaxCapPerMonth: customerDetails.consumerMaxCapPerMonth,
            isConsumerGlobal: customerDetails.isGlobal,
            consumerLocationId,
          },
        });

        await prisma.feesToFeesDetail.create({
          data: {
            feeId: fee.id,
            vendorDetailId: vendorDetail.id,
            consumerDetailId: consumerDetail.id
          }
        })
      }

      // Step 4: Respond with success
      return {
        status: true,
        message: 'Fetched Successfully',
        data: fee,
      }

    } catch (error) {
      console.error(error);
      return {
        status: false,
        message: 'Error in createFees',
        error: error.message
      }
    }
  };

  // async createFees2(payload: any) {
  //   try {
  //     // Step 1: Create the initial fee
  //     let createFees = await prisma.fees.create({
  //       data: {
  //         feeName: payload.feeName,
  //         feeDescription: payload.feeDescription,
  //         vendorPercentage: parseFloat(payload.vendorPercentage),
  //         vendorMaxCapPerDeal: parseFloat(payload.vendorMaxCapPerDeal),
  //         vendorVat: parseFloat(payload.vendorVat),
  //         vendorPaymentGateFee: parseFloat(payload.vendorPaymentGateFee),
  //         vendorFixFee: parseFloat(payload.vendorFixFee),
  //         vendorMaxCapPerMonth: payload.vendorMaxCapPerMonth,
  //         consumerPercentage: parseFloat(payload.consumerPercentage),
  //         consumerMaxCapPerDeal: parseFloat(payload.consumerMaxCapPerDeal),
  //         consumerVat: parseFloat(payload.consumerVat),
  //         consumerPaymentGateFee: parseFloat(payload.consumerPaymentGateFee),
  //         consumerFixFee: parseFloat(payload.consumerFixFee),
  //         consumerMaxCapPerMonth: payload.consumerMaxCapPerMonth,
  //         policyId: payload.policyId,
  //       },
  //     });

  //     // Collect all created data in a structured format
  //     const resultData = {
  //       fee: createFees,
  //       countries: [] as any[],
  //     };

  //     // Step 2: Check for countries and iterate through each country
  //     if (payload.countries && payload.countries.length > 0) {
  //       for (let i = 0; i < payload.countries.length; i++) {
  //         const country = payload.countries[i];

  //         let countryExist = await prisma.feesCountry.findFirst({
  //           where: {
  //             feeId: createFees.id,
  //             countryId: country.countryId,
  //           },
  //         });

  //         if (!countryExist) {
  //           // Step 3: Create country entry if it doesn't exist
  //           let createFeesCountry = await prisma.feesCountry.create({
  //             data: {
  //               feeId: createFees.id,
  //               countryId: country.countryId,
  //             },
  //           });

  //           const countryData = {
  //             country: createFeesCountry,
  //             states: [] as any[],
  //           };

  //           // Step 4: Check for states in the current country
  //           if (country.states && country.states.length > 0) {
  //             for (let j = 0; j < country.states.length; j++) {
  //               const state = country.states[j];

  //               let stateExist = await prisma.feesState.findFirst({
  //                 where: {
  //                   feeId: createFees.id,
  //                   feesCountryId: createFeesCountry.id,
  //                   stateId: state.stateId,
  //                 },
  //               });

  //               if (!stateExist) {
  //                 // Step 5: Create state entry if it doesn't exist
  //                 let createFeesState = await prisma.feesState.create({
  //                   data: {
  //                     feeId: createFees.id,
  //                     feesCountryId: createFeesCountry.id,
  //                     countryId: createFeesCountry.countryId,
  //                     stateId: state.stateId,
  //                   },
  //                 });

  //                 const stateData = {
  //                   state: createFeesState,
  //                   cities: [] as any[],
  //                 };

  //                 // Step 6: Check for cities in the current state
  //                 if (state.cities && state.cities.length > 0) {
  //                   for (let k = 0; k < state.cities.length; k++) {
  //                     const city = state.cities[k];

  //                     let cityExist = await prisma.feesCity.findFirst({
  //                       where: {
  //                         feeId: createFees.id,
  //                         feesStateId: createFeesState.id,
  //                         cityId: city.cityId,
  //                       },
  //                     });

  //                     if (!cityExist) {
  //                       // Step 7: Create city entry if it doesn't exist
  //                       let createFeesCity = await prisma.feesCity.create({
  //                         data: {
  //                           feeId: createFees.id,
  //                           feesCountryId: createFeesCountry.id,
  //                           feesStateId: createFeesState.id,
  //                           countryId: createFeesCountry.countryId,
  //                           stateId: createFeesState.stateId,
  //                           cityId: city.cityId,
  //                         },
  //                       });

  //                       const cityData = {
  //                         city: createFeesCity,
  //                         towns: [] as any[],
  //                       };

  //                       // Step 8: Check for towns in the current city
  //                       if (city.towns && city.towns.length > 0) {
  //                         for (let m = 0; m < city.towns.length; m++) {
  //                           const town = city.towns[m];

  //                           const createFeesTown = await prisma.feesTown.create({
  //                             data: {
  //                               feeId: createFees.id,
  //                               feesCountryId: createFeesCountry.id,
  //                               feesStateId: createFeesState.id,
  //                               feesCityId: createFeesCity.id,
  //                               countryId: createFeesCountry.countryId,
  //                               stateId: createFeesState.stateId,
  //                               cityId: createFeesCity.cityId,
  //                               town: town.town,
  //                               // vendorPercentage: parseFloat(town.vendorPercentage),
  //                               // vendorMaxCapPerDeal: parseFloat(town.vendorMaxCapPerDeal),
  //                               // vendorVat: parseFloat(town.vendorVat),
  //                               // vendorPaymentGateFee: parseFloat(town.vendorPaymentGateFee),
  //                               // vendorFixFee: parseFloat(town.vendorFixFee),
  //                               // vendorMaxCapPerMonth: town.vendorMaxCapPerMonth,
  //                               // consumerPercentage: parseFloat(town.consumerPercentage),
  //                               // consumerMaxCapPerDeal: parseFloat(town.consumerMaxCapPerDeal),
  //                               // consumerVat: parseFloat(town.consumerVat),
  //                               // consumerPaymentGateFee: parseFloat(town.consumerPaymentGateFee),
  //                               // consumerFixFee: parseFloat(town.consumerFixFee),
  //                               // consumerMaxCapPerMonth: town.consumerMaxCapPerMonth,
  //                               // policyId: town.policyId,
  //                             },
  //                           });

  //                           cityData.towns.push(createFeesTown);
  //                         }
  //                       }

  //                       stateData.cities.push(cityData);
  //                     }
  //                   }
  //                 }

  //                 countryData.states.push(stateData);
  //               }
  //             }
  //           }

  //           resultData.countries.push(countryData);
  //         }
  //       }
  //     }

  //     return {
  //       status: true,
  //       message: 'Created Successfully',
  //       data: resultData,
  //     };
  //   } catch (error) {
  //     return {
  //       status: false,
  //       message: 'Error in createFees',
  //       error: error.message,
  //     };
  //   }
  // }

  async getAllFees(req: any, page: any, limit: any, sort: any, searchTerm: any) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize;
      const sortType = 'desc';
      let searchTERM = searchTerm?.length > 2 ? searchTerm : ''

      let getAllFees = await prisma.fees.findMany({
        where: {
          status: 'ACTIVE',
          feeName: {
            contains: searchTERM,
            mode: 'insensitive'
          },
        },
        include: {
          fees_policy: {
            where: { status: "ACTIVE" },
          },
          feesToFeesDetail: {
            where: { status: "ACTIVE" },
            include: {
              vendorDetail: {
                where: { status: "ACTIVE" },
                include: {
                  vendorLocation: {
                    where: { status: "ACTIVE" },
                    include: {
                      feesLocation_country: true,
                      feesLocation_state: true,
                      feesLocation_city: true,
                    }
                  }
                }
              },
              consumerDetail: {
                where: { status: "ACTIVE" },
                include: {
                  consumerLocation: {
                    where: { status: "ACTIVE" },
                    include: {
                      feesLocation_country: true,
                      feesLocation_state: true,
                      feesLocation_city: true,
                    }
                  }
                }
              },

            }
          }
          // fees_feesCountry: {
          //   where: { status: "ACTIVE" },
          //   include: {
          //     feesCountry_country: true,
          //     feesCountry_feesState: {
          //       where: { status: "ACTIVE" },
          //       include: {
          //         feesState_state: true,
          //         feesState_feesCity: {
          //           where: { status: "ACTIVE" },
          //           include: {
          //             feesCity_city: true,
          //             feesCity_feesTown: {
          //               where: { status: "ACTIVE" },
          //             }
          //           }
          //         }
          //       }
          //     }
          //   }
          // }
        },
        orderBy: { createdAt: sortType },
        skip, // Offset
        take: pageSize, // Limit
      });

      if (!getAllFees || getAllFees.length === 0) {
        return {
          status: false,
          message: 'No Fees Found',
          data: [],
          totalCount: 0
        }
      }

      let getAllCountryCount = await prisma.fees.count({
        where: {
          status: 'ACTIVE',
          feeName: {
            contains: searchTERM,
            mode: 'insensitive'
          }
        },
      });

      return {
        status: true,
        message: 'Fetched Successfully',
        data: getAllFees,
        totalCount: getAllCountryCount
      }
    } catch (error) {
      return {
        status: false,
        message: 'Error in getAllFees',
        error: error.message
      }
    }
  }

  async updateFees(payload: any) {
    try {
      const { feeId, feeName, feeDescription, policy, feesDetails, feeType, menuId } = payload;

      // Step 1: Validate required fields
      if (!feeId) {
        return {
          status: false,
          message: "feeId is required.",
        };
      }

      const menuIdExist = await prisma.fees.findFirst({
        where: { 
          menuId: menuId,
          id: { notIn: [feeId] }
        }
      });
      if (menuIdExist) {
        return {
          status: false,
          message: "menu is already associated with other fees",
          data: [],
        };
      }

      // Step 2: Update the main fee record
      const updatedFee = await prisma.fees.update({
        where: {
          id: feeId,
        },
        data: {
          feeName: feeName,
          feeDescription: feeDescription,
          policyId: policy,
          feeType: feeType,
          menuId: menuId
        },
      });

      // Step 3: Process and update feeDetails (vendor and consumer)
      for (const detail of feesDetails) {
        const { vendorDetails, customerDetails } = detail;

        // Step 3.1: Update vendor fee details and location
        if (vendorDetails.vendorFeesDetailId) {
          if (!vendorDetails.isGlobal && vendorDetails.location) {
            await prisma.feesLocation.update({
              where: { id: vendorDetails.location.vendorLocationId },
              data: {
                countryId: vendorDetails.location.countryId,
                stateId: vendorDetails.location.stateId,
                cityId: vendorDetails.location.cityId,
                town: vendorDetails.location.town,
              },
            });
          }

          await prisma.feesDetail.update({
            where: { id: vendorDetails.vendorFeesDetailId },
            data: {
              feesType: "vendor",
              vendorPercentage: vendorDetails.vendorPercentage,
              vendorMaxCapPerDeal: vendorDetails.vendorMaxCapPerDeal,
              vendorVat: vendorDetails.vendorVat,
              vendorPaymentGateFee: vendorDetails.vendorPaymentGateFee,
              vendorFixFee: vendorDetails.vendorFixFee,
              vendorMaxCapPerMonth: vendorDetails.vendorMaxCapPerMonth,
              isVendorGlobal: vendorDetails.isGlobal,
              vendorLocationId: vendorDetails.isGlobal ? null : vendorDetails.location.vendorLocationId,
            },
          });
        }

        // Step 3.2: Update consumer fee details and location
        if (customerDetails.consumerFeesDetailId) {
          if (!customerDetails.isGlobal && customerDetails.location) {
            await prisma.feesLocation.update({
              where: { id: customerDetails.location.consumerLocationId },
              data: {
                countryId: customerDetails.location.countryId,
                stateId: customerDetails.location.stateId,
                cityId: customerDetails.location.cityId,
                town: customerDetails.location.town,
              },
            });
          }

          await prisma.feesDetail.update({
            where: { id: customerDetails.consumerFeesDetailId },
            data: {
              feesType: "consumer",
              consumerPercentage: customerDetails.consumerPercentage,
              consumerMaxCapPerDeal: customerDetails.consumerMaxCapPerDeal,
              consumerVat: customerDetails.consumerVat,
              consumerPaymentGateFee: customerDetails.consumerPaymentGateFee,
              consumerFixFee: customerDetails.consumerFixFee,
              consumerMaxCapPerMonth: customerDetails.consumerMaxCapPerMonth,
              isConsumerGlobal: customerDetails.isGlobal,
              consumerLocationId: customerDetails.isGlobal ? null : customerDetails.location.consumerLocationId,
            },
          });
        }
      }

      return {
        status: true,
        message: "Fee updated successfully.",
        data: updatedFee,
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        message: "Error in updateFees",
        error: error.message,
      };
    }
  }

  async updateFeesDetail(payload: any) {
    try {
      const { feesDetailId, vendorDetails, customerDetails } = payload;

      // Step 1: Validate required fields
      if (!feesDetailId) {
        return {
          status: false,
          message: "feesDetailId is required.",
        };
      }

      // Step 2: Prepare the data to update
      const updateData: any = {};

      if (vendorDetails) {
        updateData.vendorPercentage = vendorDetails.vendorPercentage || undefined;
        updateData.vendorMaxCapPerDeal = vendorDetails.vendorMaxCapPerDeal || undefined;
        updateData.vendorVat = vendorDetails.vendorVat || undefined;
        updateData.vendorPaymentGateFee = vendorDetails.vendorPaymentGateFee || undefined;
        updateData.vendorFixFee = vendorDetails.vendorFixFee || undefined;
        updateData.vendorMaxCapPerMonth = vendorDetails.vendorMaxCapPerMonth || undefined;
        updateData.isGlobalVendor = vendorDetails.isGlobal || undefined;

        if (!vendorDetails.isGlobal && vendorDetails.location) {
          updateData.vendorLocation = {
            countryId: vendorDetails.location.countryId || undefined,
            stateId: vendorDetails.location.stateId || undefined,
            cityId: vendorDetails.location.cityId || undefined,
            town: vendorDetails.location.town || undefined,
          };
        }
      }

      if (customerDetails) {
        updateData.consumerPercentage = customerDetails.consumerPercentage || undefined;
        updateData.consumerMaxCapPerDeal = customerDetails.consumerMaxCapPerDeal || undefined;
        updateData.consumerVat = customerDetails.consumerVat || undefined;
        updateData.consumerPaymentGateFee = customerDetails.consumerPaymentGateFee || undefined;
        updateData.consumerFixFee = customerDetails.consumerFixFee || undefined;
        updateData.consumerMaxCapPerMonth = customerDetails.consumerMaxCapPerMonth || undefined;
        updateData.isGlobalConsumer = customerDetails.isGlobal || undefined;

        if (!customerDetails.isGlobal && customerDetails.location) {
          updateData.consumerLocation = {
            countryId: customerDetails.location.countryId || undefined,
            stateId: customerDetails.location.stateId || undefined,
            cityId: customerDetails.location.cityId || undefined,
            town: customerDetails.location.town || undefined,
          };
        }
      }

      // Step 3: Update the feesDetail record
      const updatedFeesDetail = await prisma.feesDetail.update({
        where: {
          id: feesDetailId,
        },
        data: updateData,
      });

      // Step 4: Return success response
      return {
        status: true,
        message: "FeesDetail updated successfully.",
        data: updatedFeesDetail,
      };
    } catch (error) {
      // Step 5: Handle errors
      return {
        status: false,
        message: "Error in updateFeesDetail",
        error: error.message,
      };
    }
  }

  async getOneFees(feeId: any) {
    try {
      let feeID = parseInt(feeId);

      let getOneFees = await prisma.fees.findUnique({
        where: {
          status: "ACTIVE",
          id: feeID
        },
        include: {
          // fees_feesCountry: {
          //   where: { status: "ACTIVE" },
          //   include: {
          //     feesCountry_country: true,
          //     feesCountry_feesState: {
          //       where: { status: "ACTIVE" },
          //       include: {
          //         feesState_state: true,
          //         feesState_feesCity: {
          //           where: { status: "ACTIVE" },
          //           include: {
          //             feesCity_city: true,
          //             feesCity_feesTown: {
          //               where: { status: "ACTIVE" },
          //             }
          //           }
          //         }
          //       }
          //     }
          //   }
          // }
          fees_feesCategoryConnectTo: {
            include: {
              categoryDetail: {
                where: { status: "ACTIVE" },
              }
            }
          },
          fees_policy: {
            where: { status: "ACTIVE" },
          },
          feesToFeesDetail: {
            where: { status: "ACTIVE" },
            include: {
              vendorDetail: {
                where: { status: "ACTIVE" },
                include: {
                  vendorLocation: {
                    where: { status: "ACTIVE" },
                    include: {
                      feesLocation_country: true,
                      feesLocation_state: true,
                      feesLocation_city: true,
                    }
                  }
                }
              },
              consumerDetail: {
                where: { status: "ACTIVE" },
                include: {
                  consumerLocation: {
                    where: { status: "ACTIVE" },
                    include: {
                      feesLocation_country: true,
                      feesLocation_state: true,
                      feesLocation_city: true,
                    }
                  }
                }
              },

            }
          }
        }
      })

      if (!getOneFees) {
        return {
          status: false,
          message: "Not Found",
          data: []
        }
      }

      return {
        status: true,
        message: "Fetch Successfully",
        data: getOneFees
      }
    } catch (error) {
      return {
        status: false,
        message: 'Error in getOneFees',
        error: error.message
      }
    }
  }

  async deleteFees(feeId: any) {
    try {

      const feeID = parseInt(feeId);
      // First, find all related FeesDetail records for the given feeId
      const feeDetails = await prisma.feesDetail.findMany({
        where: {
          feeId: feeID,
        },
      });

      // If there are related FeesDetail records
      if (feeDetails.length > 0) {
        // Loop through the feeDetails and delete the related FeesLocation records
        for (const detail of feeDetails) {
          // Delete the vendorLocation if it exists
          if (detail.vendorLocationId) {
            await prisma.feesLocation.delete({
              where: {
                id: detail.vendorLocationId,
              },
            });
          }

          // Delete the consumerLocation if it exists
          if (detail.consumerLocationId) {
            await prisma.feesLocation.delete({
              where: {
                id: detail.consumerLocationId,
              },
            });
          }
        }

        // Delete all FeesToFeesDetail records for the given feeId
        await prisma.feesToFeesDetail.deleteMany({
          where: {
            feeId: feeID
          }
        })

        // Delete all FeesDetail records for the given feeId
        await prisma.feesDetail.deleteMany({
          where: {
            feeId: feeID,
          },
        });
      }

      // Finally, delete the main Fees record
      await prisma.fees.delete({
        where: {
          id: feeID,
        },
      });

      return {
        status: true,
        message: 'Fees and related details have been successfully deleted.',
      };
    } catch (error) {
      return {
        status: false,
        message: 'Error in deleting fees and related details.',
        error: error.message,
      };
    }
  }

  async deleteLocation(id: any) {
    try {
      let ID = parseInt(id);

      // Step 1: Fetch the FeesToFeesDetail record by ID
      const feesToFeesDetail = await prisma.feesToFeesDetail.findUnique({
        where: { id: ID },
        include: {
          vendorDetail: { include: { vendorLocation: true } },
          consumerDetail: { include: { consumerLocation: true } },
        },
      });

      if (!feesToFeesDetail) {
        return {
          status: false,
          message: `FeesToFeesDetail with ID ${ID} not found.`,
          data: [],
        };
      }

      // Step 2: Handle deletion for vendorDetail and its location
      if (feesToFeesDetail.vendorDetail) {
        const vendorDetailId = feesToFeesDetail.vendorDetailId;

        // Check if isVendorGlobal is false (if global, skip deleting location)
        if (!feesToFeesDetail.vendorDetail.isVendorGlobal && feesToFeesDetail.vendorDetail.vendorLocationId) {
          // Delete vendorLocation if it exists
          await prisma.feesLocation.delete({
            where: { id: feesToFeesDetail.vendorDetail.vendorLocationId },
          });
        }

        // Delete vendorDetail
        await prisma.feesDetail.delete({
          where: { id: vendorDetailId },
        });
      }

      // Step 3: Handle deletion for consumerDetail and its location
      if (feesToFeesDetail.consumerDetail) {
        const consumerDetailId = feesToFeesDetail.consumerDetailId;

        // Check if isConsumerGlobal is false (if global, skip deleting location)
        if (!feesToFeesDetail.consumerDetail.isConsumerGlobal && feesToFeesDetail.consumerDetail.consumerLocationId) {
          // Delete consumerLocation if it exists
          await prisma.feesLocation.delete({
            where: { id: feesToFeesDetail.consumerDetail.consumerLocationId },
          });
        }

        // Delete consumerDetail
        await prisma.feesDetail.delete({
          where: { id: consumerDetailId },
        });
      }

      // Step 4: Delete the FeesToFeesDetail record itself
      await prisma.feesToFeesDetail.delete({
        where: { id: ID },
      });

      return {
        status: true,
        message: "Location fees details successfully deleted.",
        data: [],
      };
    } catch (error) {
      return {
        status: false,
        message: "Error in deleting location fees details.",
        error: error.message,
      };
    }
  }


  // not in use
  async deleteLocationFees(id: any, type: any) {
    try {
      let ID = parseInt(id);

      if (type === "vendor") {
        // Step 1: Fetch the vendor detail by ID
        const vendorDetail = await prisma.feesDetail.findUnique({
          where: { id: ID },
          include: { vendorLocation: true, feesDetailVendor: true },
        });

        if (!vendorDetail) {
          return {
            status: false,
            message: `Vendor detail with ID ${ID} not found.`,
            data: [],
          };
        }

        // Step 2: Check and delete associated vendorLocation
        if (vendorDetail.vendorLocationId) {
          await prisma.feesLocation.delete({
            where: { id: vendorDetail.vendorLocationId },
          });
        }

        // Step 3: Delete from FeesToFeesDetail
        await prisma.feesToFeesDetail.deleteMany({
          where: { vendorDetailId: ID },
        });

        // Step 4: Delete the vendorDetail itself
        await prisma.feesDetail.delete({
          where: { id: ID },
        });

        return {
          status: true,
          message: "Vendor detail and associated data successfully deleted.",
          data: [],
        };
      } else if (type === "consumer") {
        // Step 1: Fetch the consumer detail by ID
        const consumerDetail = await prisma.feesDetail.findUnique({
          where: { id: ID },
          include: { consumerLocation: true, feesDetailConsumer: true },
        });

        if (!consumerDetail) {
          return {
            status: false,
            message: `Consumer detail with ID ${ID} not found.`,
            data: [],
          };
        }

        // Step 2: Check and delete associated consumerLocation
        if (consumerDetail.consumerLocationId) {
          await prisma.feesLocation.delete({
            where: { id: consumerDetail.consumerLocationId },
          });
        }

        // Step 3: Delete from FeesToFeesDetail
        await prisma.feesToFeesDetail.deleteMany({
          where: { consumerDetailId: ID },
        });

        // Step 4: Delete the consumerDetail itself
        await prisma.feesDetail.delete({
          where: { id: ID },
        });

        return {
          status: true,
          message: "Consumer detail and associated data successfully deleted.",
          data: [],
        };
      } else {
        return {
          status: false,
          message: "Invalid type specified. Use 'vendor' or 'consumer'.",
          data: [],
        };
      }
    } catch (error) {
      return {
        status: false,
        message: "Error in deleting location fees details.",
        error: error.message,
      };
    }
  }

  // async deleteFees(feeId: any) {
  //   try {
  //     let feeID = parseInt(feeId);

  //     let getOneFees = await prisma.fees.findUnique({
  //       where: { 
  //         status: "ACTIVE",
  //         id: feeID 
  //       }
  //     })

  //     if (!getOneFees) {
  //       return {
  //         status: false,
  //         message: "Not Found",
  //         data: []
  //       }
  //     }

  //     // Soft delete the fee by updating its status and setting deletedAt timestamp
  //     let deletedFee = await prisma.fees.update({
  //       where: { id: feeID },
  //       data: {
  //         status: "DELETE",
  //         deletedAt: new Date(),
  //       },
  //     });

  //     // If there are dependent records like `FeesCountry`, `FeesState`, etc.,
  //     // Soft delete them too (optional based on requirements)
  //     await prisma.feesCountry.updateMany({
  //       where: { feeId: feeID, status: "ACTIVE" },
  //       data: {
  //         status: "DELETE",
  //         deletedAt: new Date(),
  //       },
  //     });

  //     await prisma.feesState.updateMany({
  //       where: { feeId: feeID, status: "ACTIVE" },
  //       data: {
  //         status: "DELETE",
  //         deletedAt: new Date(),
  //       },
  //     });

  //     await prisma.feesCity.updateMany({
  //       where: { feeId: feeID, status: "ACTIVE" },
  //       data: {
  //         status: "DELETE",
  //         deletedAt: new Date(),
  //       },
  //     });

  //     await prisma.feesTown.updateMany({
  //       where: { feeId: feeID, status: "ACTIVE" },
  //       data: {
  //         status: "DELETE",
  //         deletedAt: new Date(),
  //       },
  //     });

  //     return {
  //       status: true,
  //       message: "Fee deleted successfully",
  //       data: deletedFee,
  //     };

  //   } catch (error) {
  //     return {
  //       status: false,
  //       message: 'Error in deleteFees',
  //       error: error.message
  //     }
  //   }
  // }

  // -----------------------------------------------Not in use
  async deleteLocationByType(id: any, type: any) {
    try {
      let ID = parseInt(id);

      if (type === "COUNTRY") {
        // Hard delete FeesCountry
        let feesCountry = await prisma.feesCountry.findUnique({
          where: { id: ID },
        });

        if (!feesCountry) {
          return {
            status: false,
            message: "FeesCountry not found",
          };
        }

        // Check and delete associated FeesState
        let feesStates = await prisma.feesState.findMany({
          where: { feesCountryId: ID },
        });

        for (let state of feesStates) {
          await this.deleteLocationByType(state.id, "STATE");
        }

        // Hard delete FeesCountry
        await prisma.feesCountry.delete({
          where: { id: ID },
        });

        return {
          status: true,
          message: "FeesCountry and its dependencies deleted successfully",
        };
      } else if (type === "STATE") {
        // Hard delete FeesState
        let feesState = await prisma.feesState.findUnique({
          where: { id: ID },
        });

        if (!feesState) {
          return {
            status: false,
            message: "FeesState not found",
          };
        }

        // Check and delete associated FeesCity
        let feesCities = await prisma.feesCity.findMany({
          where: { feesStateId: ID },
        });

        for (let city of feesCities) {
          await this.deleteLocationByType(city.id, "CITY");
        }

        // Hard delete FeesState
        await prisma.feesState.delete({
          where: { id: ID },
        });

        return {
          status: true,
          message: "FeesState and its dependencies deleted successfully",
        };
      } else if (type === "CITY") {
        // Hard delete FeesCity
        let feesCity = await prisma.feesCity.findUnique({
          where: { id: ID },
        });

        if (!feesCity) {
          return {
            status: false,
            message: "FeesCity not found",
          };
        }

        // Check and delete associated FeesTown
        let feesTowns = await prisma.feesTown.findMany({
          where: { feesCityId: ID },
        });

        for (let town of feesTowns) {
          await this.deleteLocationByType(town.id, "TOWN");
        }

        // Hard delete FeesCity
        await prisma.feesCity.delete({
          where: { id: ID },
        });

        return {
          status: true,
          message: "FeesCity and its dependencies deleted successfully",
        };
      } else if (type === "TOWN") {
        // Hard delete FeesTown
        let feesTown = await prisma.feesTown.findUnique({
          where: { id: ID },
        });

        if (!feesTown) {
          return {
            status: false,
            message: "FeesTown not found",
          };
        }

        // Hard delete FeesTown
        await prisma.feesTown.delete({
          where: { id: ID },
        });

        return {
          status: true,
          message: "FeesTown deleted successfully",
        };
      } else {
        return {
          status: false,
          message: "Invalid type provided",
        };
      }
    } catch (error) {
      return {
        status: false,
        message: "Error in deleteLocationByType",
        error: error.message,
      };
    }
  }

  // not in use
  async addCategoryToFees(payload: any) {
    try {
      let createdConnections = [];
      const feeId = payload.feeId;

      if (payload?.categoryIdList && payload?.categoryIdList.length > 0) {
        for (let i = 0; i < payload.categoryIdList.length; i++) {
          const { categoryId, categoryLocation, } = payload.categoryIdList[i];

          const existingConnection = await prisma.feesCategoryConnectTo.findFirst({
            where: {
              feeId: feeId,
              categoryId: categoryId,
            }
          });

          // If no existing connection, create a new one
          if (!existingConnection) {
            const newConnection = await prisma.feesCategoryConnectTo.create({
              data: {
                feeId: feeId,
                categoryId: categoryId,
                categoryLocation: categoryLocation,
              }
            });

            // Add the newly created connection to the response array
            createdConnections.push(newConnection);
          }
        }
      }

      return {
        status: true,
        message: 'Process completed successfully',
        data: createdConnections.length > 0 ? createdConnections : 'No new connections created'
      };
    } catch (error) {
      return {
        status: false,
        message: 'error, in addCategoryToFees',
        error: error.message
      }
    }
  }

  // not in use
  async deleteCategoryToFees(feesCategoryId: any) {
    try {
      const feesCategoryID = parseInt(feesCategoryId);

      let exist = await prisma.feesCategoryConnectTo.findUnique({
        where: { id: feesCategoryID }
      })

      if (!exist) {
        return {
          status: false,
          message: 'Not Found',
          data: []
        }
      }

      let deleteFeesCategoryConnectTo = await prisma.feesCategoryConnectTo.delete({
        where: { id: feesCategoryID }
      });

      return {
        status: true,
        message: 'Deleted Successfully',
        data: deleteFeesCategoryConnectTo
      }
    } catch (error) {
      return {
        status: false,
        message: 'error, in deleteCategoryToFees',
        error: error.message
      }
    }
  }

}
