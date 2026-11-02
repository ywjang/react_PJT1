const field = (key,label,options={}) => ({key,label,...options})
const stuNo=field('STU_NO','학번',{type:'number',min:1,max:99999999})
const subNo=field('SUB_NO','과목번호',{type:'number',min:1,max:999})
const studentFields=[stuNo,field('STU_NAME','학생명',{maxLength:20}),field('STU_DEPT','학과',{maxLength:20}),field('STU_GRADE','학년',{type:'number',min:1,max:4}),field('STU_CLASS','반',{maxLength:1}),field('STU_GENDER','성별'),field('STU_HEIGHT','키(㎝)',{type:'number',min:50,max:250,step:0.1,optional:true}),field('STU_WEIGHT','몸무게(㎏)',{type:'number',min:10,max:300,step:0.1,optional:true})]
const subjectFields=[subNo,field('SUB_NAME','과목명',{maxLength:20}),field('SUB_PROF','담당교수',{maxLength:20}),field('SUB_GRADE','대상 학년',{type:'number',min:1,max:4}),field('SUB_DEPT','개설 학과',{maxLength:20})]
const enrolFields=[subNo,stuNo,field('ENR_GRADE','성적',{type:'number',min:0,max:100})]
export const definitions={
 students:{title:'학생 관리',singular:'학생',description:'학생 정보를 검색하고 등록·수정·삭제합니다.',search:'학번, 학생명, 학과로 검색',keys:['STU_NO'],fields:studentFields,columns:studentFields},
 subjects:{title:'과목 관리',singular:'과목',description:'개설 과목과 담당교수 정보를 관리합니다.',search:'과목번호, 과목명, 담당교수, 학과로 검색',keys:['SUB_NO'],fields:subjectFields,columns:subjectFields},
 enrolments:{title:'수강·성적 관리',singular:'수강',description:'학생별 수강 과목과 성적을 관리합니다.',search:'학번, 학생명, 과목번호, 과목명으로 검색',keys:['SUB_NO','STU_NO'],fields:enrolFields,columns:[stuNo,field('STU_NAME','학생명'),subNo,field('SUB_NAME','과목명'),enrolFields[2]]}
}
export function validate(kind,values){const errors={};for(const f of definitions[kind].fields){const value=String(values[f.key]??'').trim();if(!value){if(!f.optional)errors[f.key]=f.label+'을(를) 입력하세요.';continue}if(f.type==='number'){const n=Number(value);if(!Number.isFinite(n)||n<f.min||n>f.max||(f.step!==0.1&&!Number.isInteger(n)))errors[f.key]=f.min+'~'+f.max+' 범위의 '+(f.step===0.1?'숫자':'정수')+'를 입력하세요.'}else if(f.maxLength&&value.length>f.maxLength)errors[f.key]=f.maxLength+'자 이하로 입력하세요.';if(f.key==='STU_GENDER'&&!['M','F'].includes(value))errors[f.key]='성별을 선택하세요.'}return errors}
export function display(key,value){if(value==null||value==='')return '미입력';if(key==='STU_GENDER')return value==='M'?'남성':value==='F'?'여성':'미지정';return String(value)}
