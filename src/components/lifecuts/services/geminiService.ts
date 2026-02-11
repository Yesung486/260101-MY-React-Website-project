// Predefined list of sentimental Korean captions suitable for photo strips
const CAPTIONS = [
  "너와 나의 반짝이는 순간 ✨",
  "오늘을 기억해, 우리들의 페이지",
  "가장 예쁜 나이, 바로 지금",
  "행복 박제 완료! 🥰",
  "우리의 봄날은 언제나 지금",
  "소확행 제대로 즐기는 중",
  "이 멤버 리멤버 포에버",
  "오늘 유독 예뻐 보이네",
  "낭만 가득한 하루의 끝자락",
  "일상 속 작은 선물 같은 하루",
  "꿈꾸던 순간이 바로 여기",
  "웃음꽃 핀 우리의 네 컷",
  "기억될 오늘의 분위기",
  "사랑스러운 우리들",
  "반짝반짝 빛나는 청춘",
  "함께라서 더 빛나는 오늘",
  "지금을 사랑하자 Love Yourself",
  "우리의 시간은 멈추지 않아",
  "스쳐가는 순간을 영원히",
  "오늘도 수고했어, 토닥토닥"
];

export const generatePhotoCaption = async (): Promise<string> => {
  // Simulate network delay for a better UX "processing" feel (cognitive pause)
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const randomIndex = Math.floor(Math.random() * CAPTIONS.length);
  return CAPTIONS[randomIndex];
};