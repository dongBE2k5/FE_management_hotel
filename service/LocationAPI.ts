import BaseUrl from '../constants/BaseURL';
import Location from '../models/Location';
async function getAllLocation(): Promise<Location[]> {
  const res = await fetch(`${BaseUrl}/locations`);
  
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  // ép kiểu dữ liệu trả về
  const data: Location[] = await res.json();
  return data;
}
getAllLocation().then(location => {
  console.log(location);
});

export { getAllLocation };
