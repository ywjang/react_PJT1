import test from 'node:test'
import assert from 'node:assert/strict'
import { validate, display } from '../src/academic.js'
const student={STU_NO:20269999,STU_NAME:'홍길동',STU_DEPT:'컴퓨터정보',STU_GRADE:2,STU_CLASS:'A',STU_GENDER:'M'}
test('학생 필수 입력과 범위 검증',()=>{assert.deepEqual(validate('students',student),{});assert.ok(validate('students',{...student,STU_GRADE:0}).STU_GRADE);assert.ok(validate('students',{...student,STU_NAME:' '}).STU_NAME);assert.ok(validate('students',{...student,STU_NO:1.5}).STU_NO)})
test('성적 경계와 한글 표시',()=>{assert.deepEqual(validate('enrolments',{SUB_NO:101,STU_NO:20269999,ENR_GRADE:0}),{});assert.ok(validate('enrolments',{SUB_NO:101,STU_NO:20269999,ENR_GRADE:101}).ENR_GRADE);assert.equal(display('STU_GENDER','F'),'여성');assert.equal(display('STU_HEIGHT',null),'미입력')})
