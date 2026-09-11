const API="http://127.0.0.1:8000/students";

let students=[];
let editId=null;

window.onload=loadStudents;

async function loadStudents(){

showLoading(true);

try{

const res=await fetch(API);

if(!res.ok) throw new Error("Server Error");

students=await res.json();

renderTable(students);

calculateStats(students);

populateCourses();

}catch(e){

showToast("Backend offline","error");

}

showLoading(false);

}

async function addStudent(data){

await fetch(API,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(data)
});

showToast("Student Added");

}

async function updateStudent(data){

await fetch(`${API}/${editId}`,{
method:"PUT",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(data)
});

showToast("Student Updated");

}

async function deleteStudent(id){

if(!confirm("Delete student?")) return;

await fetch(`${API}/${id}`,{method:"DELETE"});

showToast("Deleted");

loadStudents();

}

document.getElementById("studentForm").onsubmit=async e=>{

e.preventDefault();

if(!validate()) return;

const data={
name:name.value.trim(),
course:course.value.trim(),
marks:Number(marks.value)
};

try{

if(editId){

await updateStudent(data);

}else{

await addStudent(data);

}

clearForm();

loadStudents();

}catch{

showToast("Operation failed","error");

}

};

function renderTable(list){

const table=document.getElementById("studentTable");

table.innerHTML="";

document.getElementById("emptyState").classList.toggle("hidden",list.length>0);

list.forEach(s=>{

table.innerHTML+=`
<tr>
<td>${s.id}</td>
<td>${s.name}</td>
<td>${s.course}</td>
<td>${s.marks}</td>
<td>
<button class="action-btn edit" onclick="editStudent(${s.id})">Edit</button>
<button class="action-btn delete" onclick="deleteStudent(${s.id})">Delete</button>
</td>
</tr>
`;

});

}

function editStudent(id){

const s=students.find(x=>x.id===id);

editId=id;

name.value=s.name;
course.value=s.course;
marks.value=s.marks;

submitBtn.textContent="Update Student";

}

function clearForm(){

editId=null;

studentForm.reset();

submitBtn.textContent="Add Student";

clearErrors();

}

function validate(){

clearErrors();

let ok=true;

if(!name.value.trim()){

nameError.textContent="Name required";

ok=false;

}

if(!course.value.trim()){

courseError.textContent="Course required";

ok=false;

}

const m=Number(marks.value);

if(m<0||m>100||isNaN(m)){

marksError.textContent="Marks 0-100";

ok=false;

}

return ok;

}

function clearErrors(){

nameError.textContent="";
courseError.textContent="";
marksError.textContent="";

}

function calculateStats(list){

totalStudents.textContent=list.length;

if(!list.length){

avgMarks.textContent=0;
highestMarks.textContent=0;
lowestMarks.textContent=0;

return;

}

const marksList=list.map(x=>x.marks);

avgMarks.textContent=(marksList.reduce((a,b)=>a+b,0)/marksList.length).toFixed(1);

highestMarks.textContent=Math.max(...marksList);

lowestMarks.textContent=Math.min(...marksList);

}

function populateCourses(){

const courses=[...new Set(students.map(x=>x.course))];

courseFilter.innerHTML='<option value="">All Courses</option>';

courses.forEach(c=>{

courseFilter.innerHTML+=`<option>${c}</option>`;

});

}

function applyFilters(){

let list=[...students];

const search=searchInput.value.toLowerCase();

const courseVal=courseFilter.value;

const sort=sortMarks.value;

if(search){

list=list.filter(s=>
s.name.toLowerCase().includes(search)||
s.course.toLowerCase().includes(search)
);

}

if(courseVal){

list=list.filter(s=>s.course===courseVal);

}

if(sort==="asc"){

list.sort((a,b)=>a.marks-b.marks);

}

if(sort==="desc"){

list.sort((a,b)=>b.marks-a.marks);

}

renderTable(list);

calculateStats(list);

}

function showToast(msg){

const t=toast;

t.textContent=msg;

t.style.display="block";

setTimeout(()=>t.style.display="none",2500);

}

function showLoading(state){

loading.classList.toggle("hidden",!state);

}