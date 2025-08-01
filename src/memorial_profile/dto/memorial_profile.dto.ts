import { CreateFamilyDto } from "./create-family.dto";
import { CreateGuestBookDto } from "./create-guestbook.dto";
import { CreateGalleryDto } from "./create-gallery.dto";
import { CreateBiographyDto } from "./create-biography.dto";


export class CreateDeadPersonProfileDto {
  owner_id: string
  name?: string;
  profile_image?: string;
  background_image?: string;
  born_date?: string;
  death_date?: string;
  memorial_place?: string;
  slug: string;

  biography?: CreateBiographyDto[];
  gallery?: CreateGalleryDto[];
  family?: CreateFamilyDto[];
  guestBook?: CreateGuestBookDto[];
}
