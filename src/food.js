export const FOOD_CATEGORIES = [
 {id:'korean',label:'한식',icon:'🍚',hint:'든든한 밥 한 끼',query:'한식'},
 {id:'snack',label:'분식',icon:'🍙',hint:'가볍게 즐기는 한 끼',query:'분식'},
 {id:'noodles',label:'면 요리',icon:'🍜',hint:'따뜻한 국물과 면',query:'국수 우동'},
 {id:'japanese',label:'일식',icon:'🍣',hint:'초밥부터 덮밥까지',query:'일식'},
 {id:'western',label:'양식',icon:'🍝',hint:'파스타와 브런치',query:'파스타 브런치'},
 {id:'cafe',label:'카페',icon:'☕',hint:'잠깐 쉬어가는 시간',query:'카페'},
]
export function foodSearchTerm(region, categoryId, budget = false) {
 const category=FOOD_CATEGORIES.find(item=>item.id===categoryId)
 if (!region?.name || !category) throw new Error('지역과 음식 종류를 확인하세요.')
 return [region.name,budget?'가성비':'',category.query,categoryId==='cafe'?'추천':'맛집'].filter(Boolean).join(' ')
}
