interface ILatLng {
  lat: number;
  lng: number;
}

/** Extract lat/lng from a Google Maps URL. */
export const extractGoogleMapsLatLng = (urlString: string): ILatLng | null => {
  const s = urlString.trim();

  const placeCoord = s.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
  if (placeCoord) {
    return { lat: parseFloat(placeCoord[1]), lng: parseFloat(placeCoord[2]) };
  }

  const atCoord = s.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)(?:,|$)/);
  if (atCoord) {
    return { lat: parseFloat(atCoord[1]), lng: parseFloat(atCoord[2]) };
  }

  const qCenter = s.match(/[?&]center=(-?\d+\.?\d*),(-?\d+\.?\d*)/i);
  if (qCenter) {
    return { lat: parseFloat(qCenter[1]), lng: parseFloat(qCenter[2]) };
  }

  return null;
};
