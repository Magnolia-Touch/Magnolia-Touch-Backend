import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeadPersonProfileDto } from './dto/memorial_profile.dto';
import { CreateFamilyMemberDto} from './dto/create-family.dto';
import { CreateGuestBookDto } from './dto/create-guestbook.dto';
import { generateCode } from 'src/utils/code-generator.util'; // adjust path if needed
import { HttpStatus } from '@nestjs/common';
import { CreateGalleryDto } from './dto/create-gallery.dto';

@Injectable()
export class MemorialProfileService {
  constructor(private prisma: PrismaService) {}

  //Create profile for Dead Person
  async create(dto: Partial<CreateDeadPersonProfileDto>, email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
       return {
            message: '"User Not found',
            data: null,
            status: HttpStatus.NOT_FOUND,
        };
    }
    let uniqueSlug = '';
    let isUnique = false;
    while (!isUnique) {
      const tempSlug = generateCode(); // e.g., random string like 'x7f8k9'
      const existing = await this.prisma.deadPersonProfile.findUnique({
        where: { slug: tempSlug },
      });
      if (!existing) {
        uniqueSlug = tempSlug;
        isUnique = true;
      }
    }
    const profile = await this.prisma.deadPersonProfile.create({
      data: {
        owner_id: email,
        slug: uniqueSlug,
      },
    });
    const biography = await this.prisma.biography.create({
      data: {
        deadPersonProfiles: uniqueSlug
      }
    })
    const gallery = await this.prisma.gallery.create({
      data: {
        deadPersonProfiles: uniqueSlug
      }
    })
    const family = await this.prisma.family.create({
      data: {
        deadPersonProfiles: uniqueSlug
      }
    })
    const guestbook = await this.prisma.guestBook.create({
      data: {
        deadPersonProfiles: uniqueSlug
      }
    })
    return {profile, biography, gallery, family, guestbook};

  }

  async getProfile(slug: string) {
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug },
      include: {
        biography: true,
      },
    });

    if (!profile) {
      return {
        message: 'Profile not found',
        data: null,
        status: HttpStatus.NOT_FOUND,
      };
    }

    return {
      message: 'Profile fetched successfully',
      data: profile,
      status: HttpStatus.OK,
    };
  }


  async addGuestbook(slug: string, dto: CreateGuestBookDto) {
    const { first_name, last_name, guestemail, phone, message, photo_upload } = dto;
    const date = new Date().toISOString(); // Get current date in ISO format
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug },
      include: {
        guestBook: true,
      },
    });
    if (!profile || !profile.guestBook.length) {
      return {
        message: 'Guestbook not found for this profile',
        status: HttpStatus.NOT_FOUND,
      };
    }
    
    const guestbook_id = profile.guestBook[0].guestbook_id; 
    const created = await this.prisma.guestBookItems.create({
      data: {
        guestbook_id: guestbook_id,
        first_name: first_name,
        last_name: last_name,
        email:guestemail,
        message: message,
        phone:phone,
        photo_upload: photo_upload,
        date: date,
        is_approved: false
      },
    });
    return {
      message: `GuestBook entry added`,
      data: created,
      status: HttpStatus.CREATED,
    };
  }


  async getGuestBookApproved(slug: string) {
    const profile = await this.prisma.guestBook.findFirst({
      where: { deadPersonProfiles: slug },
      include: {
        guestBookItems: {
          where: {
            is_approved: true
          }
        }
      }
    });
    if (!profile) {
      return {
        message: 'Profile not found',
        data: null,
        status: HttpStatus.NOT_FOUND,
      };
    }
    return {
      message: 'Profile fetched successfully',
      data: profile,
      status: HttpStatus.OK,
    };
  }

  async getGuestBookUnApproved(email: string, slug: string) {
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug }
    });
    
    if (!profile) {
      return {
        message: 'Profile not found',
        data: null,
        status: HttpStatus.NOT_FOUND,
      };
    }
    if (email != profile.owner_id) {
      return {
        message: 'You are not authorized to update this profile',
        status: HttpStatus.FORBIDDEN,
      };
    }
    const guestbook = await this.prisma.guestBook.findFirst({
      where: { deadPersonProfiles: slug },
      include: {
        guestBookItems: {
          where: {
            is_approved: false
          }
        }
      }
    });
    if (!guestbook) {
      return {
        message: 'Profile not found',
        data: null,
        status: HttpStatus.NOT_FOUND,
      };
    }
    return {
      message: 'Profile fetched successfully',
      data: guestbook,
      status: HttpStatus.OK,
    };
  }

  async updateGuestBook(email: string, slug: string, id: number) {
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug },
      include: {
        gallery: true,
      },
    });
    
    if (!profile || !profile.gallery.length) {
      return {
        message: 'Gallery not found for this profile',
        status: HttpStatus.NOT_FOUND,
      };
    }
    if (email != profile.owner_id) {
      return {
        message: 'You are not authorized to update this profile',
        status: HttpStatus.FORBIDDEN,
      };
    }
    const guestbook = await this.prisma.guestBook.findFirst({
      where: { deadPersonProfiles: slug },
      include: {
        guestBookItems: true
      }
    });
    if (!guestbook) {
      return {
        message: 'Profile not found',
        data: null,
        status: HttpStatus.NOT_FOUND,
      };
    }
    await this.prisma.guestBookItems.update({
      where: {
        guestbookitems_id: id,
        guestbook_id: guestbook.guestbook_id,
      },
      data: {
        is_approved: true,
      },
    })
    
    return {
      message: 'GuestMessage Approved Succesfully',
      status: HttpStatus.OK,
    };
  }

  async deleteGuestBook(email: string, slug: string, id: number) {
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug },
      include: {
        gallery: true,
      },
    });
    
    if (!profile || !profile.gallery.length) {
      return {
        message: 'Gallery not found for this profile',
        status: HttpStatus.NOT_FOUND,
      };
    }
    if (email != profile.owner_id) {
      return {
        message: 'You are not authorized to update this profile',
        status: HttpStatus.FORBIDDEN,
      };
    }
    const guestbook = await this.prisma.guestBook.findFirst({
      where: { deadPersonProfiles: slug },
      include: {
        guestBookItems: true
      }
    });
    if (!guestbook) {
      return {
        message: 'Profile not found',
        data: null,
        status: HttpStatus.NOT_FOUND,
      };
    }
    await this.prisma.guestBookItems.delete({
      where: {
        guestbookitems_id: id,
        guestbook_id: guestbook.guestbook_id,
      },
    })
    
    return {
      message: 'Profile Deleted successfully',
      status: HttpStatus.OK,
    };
  }

  //Add family members to the profile
  async addFamilyMembers(email: string, slug: string, relation: string, dto: CreateFamilyMemberDto) {
    const { name } = dto;
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug },
      include: {
        family: true,
      },
    });
    if (!profile || !profile.family.length) {
      return {
        message: 'Family not found for this profile',
        status: HttpStatus.NOT_FOUND,
      };
    }
    if (email != profile.owner_id) {
      return {
        message: 'You are not authorized to update this profile',
        status: HttpStatus.FORBIDDEN,
      };
    }
    const family_id = profile.family[0].family_id; // assuming one-to-one family
    // Validate relation to prevent arbitrary table access
    const validRelations = [
      'parents', 'siblings', 'cousins', 'friends', 'spouse',
      'nieceAndNephew', 'childrens', 'pets',
      'grandchildrens', 'grandparents', 'greatGrandParents',
    ];
    if (!validRelations.includes(relation)) {
      return {
        message: `Invalid relation: ${relation}`,
        status: HttpStatus.BAD_REQUEST,
      };
    }
    // Construct Prisma model name dynamically (capitalize first letter)
    const model = {
      nieceAndNephew: 'nieceAndNephew',
      grandchildrens: 'grandchildrens',
      grandparents: 'grandparents',
      greatGrandParents: 'greatGrandParents',
      pets: 'pets',
      childrens: 'childrens',
      spouse:'spouse',
      friends:'friends',
      cousins:'cousins',
      siblings:'siblings',
      parents:'parents'
    }[relation] ?? relation; // keep consistent for special cases
    const modelName = model.charAt(0).toUpperCase() + model.slice(1);
    // Create the family member using the appropriate model
    const created = await this.prisma[modelName].create({
      data: {
        name: name,
        family_id,
        deadPersonProfiles: slug,
      },
    });
    return {
      message: `${modelName} member added`,
      data: created,
      status: HttpStatus.CREATED,
    };
  }

  async getFamily(slug: string) {
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug },
      include: {
        family: {
          include: {
            parents: true,
            siblings: true,
            cousins: true,
            friends: true,
            spouse: true,
            nieceAndNephew: true,
            childrens: true,
            pets: true,
            grandchildrens: true,
            grandparents: true,
            greatGrandparents: true
          }
        }
      },
    });

    if (!profile) {
      return {
        message: 'Profile not found',
        data: null,
        status: HttpStatus.NOT_FOUND,
      };
    }

    return {
      message: 'Profile fetched successfully',
      data: profile,
      status: HttpStatus.OK,
    };
  }

  async getFamilybyId(slug: string, relation: string, id: number) {
    const validRelations = [
      'parents', 'siblings', 'cousins', 'friends', 'spouse',
      'nieceAndNephew', 'childrens', 'pets',
      'grandchildrens', 'grandparents', 'greatGrandParents',
    ];
    if (!validRelations.includes(relation)) {
      return {
        message: `Invalid relation: ${relation}`,
        status: HttpStatus.BAD_REQUEST,
      };
    }
    // Fetch the family by slug, including all possible relations
    const family = await this.prisma.family.findFirst({
      where: { deadPersonProfiles: slug },
      include: {
        parents: true,
        siblings: true,
        cousins: true,
        friends: true,
        spouse: true,
        nieceAndNephew: true,
        childrens: true,
        pets: true,
        grandchildrens: true,
        grandparents: true,
        greatGrandparents: true,
      },
    });
    if (!family) {
      return {
        message: 'Family not found for this profile',
        data: null,
        status: HttpStatus.NOT_FOUND,
      };
    }
    const members = family[relation] as any[];
    if (!members || !Array.isArray(members)) {
      return {
        message: `No members found for relation: ${relation}`,
        data: null,
        status: HttpStatus.NOT_FOUND,
      };
    }
    const member = members.find((m) => m.id === id);
    if (!member) {
      return {
        message: `No ${relation} member found with ID ${id}`,
        data: null,
        status: HttpStatus.NOT_FOUND,
      };
    }
    return {
      message: 'Family member fetched successfully',
      data: member,
      status: HttpStatus.OK,
    };
  }


  async updateFamilybyId(email: string, slug: string, relation: string, id: number, dto: CreateFamilyMemberDto) {
    const {name} = dto
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug }
    });
    if (!profile) {
      return {
        message: 'Profile not found',
        data: null,
        status: HttpStatus.NOT_FOUND,
      };
    }
    if (email != profile.owner_id) {
      return {
        message: 'You are not authorized to update this profile',
        status: HttpStatus.FORBIDDEN,
      };
    }
    const family = await this.prisma.family.findFirst({
      where: { deadPersonProfiles: slug },
    });
    if (!family) {
      throw new Error('Family not found for the provided slug');
    }
    // 2. Define a mapping of relation to corresponding model and update method
    const relationMap: Record<string, string> = {
      parents: 'parents',
      siblings: 'siblings',
      cousins: 'cousins',
      friends: 'friends',
      spouse: 'spouse',
      nieceAndNephew: 'nieceAndNephew',
      childrens: 'childrens',
      pets: 'pets',
      grandchildrens: 'grandchildrens',
      grandparents: 'grandparents',
      greatGrandparents: 'greatGrandparents',
    };
    const modelName = relationMap[relation.toLowerCase()];
    if (!modelName) {
      throw new Error(`Invalid relation type: ${relation}`);
    }
    // 3. Update the related record dynamically
    const updated = await this.prisma[modelName].update({
      where: {
        id: id,
        family_id: family.family_id,
      },
      data: {
        name: name,
      },
    });
    return { message: `${relation} updated successfully`, updated };
  }

  
  async deleteFamilybyId(email:string, slug: string, relation: string, id: number) {
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug }
    });
    if (!profile) {
      return {
        message: 'Profile not found',
        data: null,
        status: HttpStatus.NOT_FOUND,
      };
    }
    if (email != profile.owner_id) {
      return {
        message: 'You are not authorized to update this profile',
        status: HttpStatus.FORBIDDEN,
      };
    }
    // 1. Find the family using the slug
    const family = await this.prisma.family.findFirst({
      where: { deadPersonProfiles: slug },
    });
    if (!family) {
     return {
      message: "Family Not Found",
      data: null,
      status: HttpStatus.NOT_FOUND
     }
      
    }
    const relationMap: Record<string, string> = {
      parents: 'parents',
      siblings: 'siblings',
      cousins: 'cousins',
      friends: 'friends',
      spouse: 'spouse',
      nieceAndNephew: 'nieceAndNephew',
      childrens: 'childrens',
      pets: 'pets',
      grandchildrens: 'grandchildrens',
      grandparents: 'grandparents',
      greatGrandParents: 'greatGrandParents',
    };
    const modelName = relationMap[relation.toLowerCase()];
    if (!modelName) {
      throw new Error(`Invalid relation type: ${relation}`);
    }
    await this.prisma[modelName].delete({
      where: {
        id: id,
        family_id: family.family_id,
      },
    });
    return { message: `${relation} member with ID ${id} deleted successfully.` };
  }


  async addGalleryItems(email: string, slug: string, mediatype: string, dto: CreateGalleryDto) {
    const { link } = dto;
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug },
      include: {
        gallery: true,
      },
    });
    if (!profile || !profile.gallery.length) {
      return {
        message: 'Gallery not found for this profile',
        status: HttpStatus.NOT_FOUND,
      };
    }
    if (email != profile.owner_id) {
      return {
        message: 'You are not authorized to update this profile',
        status: HttpStatus.FORBIDDEN,
      };
    }
    const gallery_id = profile.gallery[0].gallery_id; // assuming one-to-one family
    // Validate relation to prevent arbitrary table access
    const validRelations = [
      'links', 'photos', 'videos'
    ];
    if (!validRelations.includes(mediatype)) {
      return {
        message: `Invalid Mediatype: ${mediatype}`,
        status: HttpStatus.BAD_REQUEST,
      };
    }
    // Construct Prisma model name dynamically (capitalize first letter)
    const model = {
      nieceAndNephew: 'links',
      grandchildrens: 'photos',
      grandparents: 'videos',

    }[mediatype] ?? mediatype; // keep consistent for special cases
    const modelName = model.charAt(0).toUpperCase() + model.slice(1);
    // Create the family member using the appropriate model
    const created = await this.prisma[modelName].create({
      data: {
        url: link,
        gallery_id,
        deadPersonProfiles: slug,
      },
    });
    return {
      message: `${modelName} entry added`,
      data: created,
      status: HttpStatus.CREATED,
    };
  }

  
  async getGallery(slug: string) {
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug },
      include: {
        gallery: {
          include: {
            photos: true,
            videos: true,
            links: true
          }
        }
      },
    });

    if (!profile) {
      return {
        message: 'Profile not found',
        data: null,
        status: HttpStatus.NOT_FOUND,
      };
    }

    return {
      message: 'Profile fetched successfully',
      data: profile,
      status: HttpStatus.OK,
    };
  }

  async deleteGalleryItems(
    email: string,
    slug: string,
    mediatype: string,
    id: number,
  ) {
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug },
      include: { gallery: true },
    });
    if (!profile || !profile.gallery.length) {
      return {
        message: 'Gallery not found for this profile',
        status: HttpStatus.NOT_FOUND,
      };
    }
    if (email !== profile.owner_id) {
      return {
        message: 'You are not authorized to update this profile',
        status: HttpStatus.FORBIDDEN,
      };
    }
    const gallery_id = profile.gallery[0].gallery_id;
    const validmedia = ['links', 'photos', 'videos'];
    if (!validmedia.includes(mediatype.toLowerCase())) {
      return {
        message: `Invalid Mediatype: ${mediatype}`,
        status: HttpStatus.BAD_REQUEST,
      };
    }
    const mediaMap: Record<string, string> = {
      photos: 'photos',
      videos: 'videos',
      links: 'links',
    };
    const idFieldsMap: Record<string, string> = {
      photos: 'photo_id',
      videos: 'video_id',
      links: 'link_id',
    };
    const modelName = mediaMap[mediatype.toLowerCase()];
    const idField = idFieldsMap[modelName];
    if (!modelName || !idField) {
      return {
        message: `Invalid or unsupported media type`,
        status: HttpStatus.BAD_REQUEST,
      };
    }
    await this.prisma[modelName].delete({
      where: {
        [idField]: id,
        gallery_id,
      } as any, // Cast to any to satisfy TS
    });
    return {
      message: `${mediatype} item with ID ${id} deleted successfully.`,
      status: HttpStatus.OK,
    };
  }
}