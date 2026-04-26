

===================================> we stop on attendance page - there are write logics and print the select schedules - 
file path - Frontend\src\workSpaceStudent\AttendenceSystem\components\src\pages\TimeTablePage.jsx 20/02/2026




22/02/2026  ===========================> we test main branch protection on push new changes

25/02/2026 ============================> we add page of analytics and update api function






Report ==========> analysis ----------- 29/03/2026 ------ Report


0) _complete_ ---------- 11/03/2026 ================> we add in frontend - networkManager file to determine the user are connected to internet or not.
1) _pending_ ------------ to the Attendnace section student can upload the schedule of attendance - when something are not changed in schedule to send (not modified) , to reduce the response size and HTTP cache

2) _complete_ -------------- using javaScript pattern in code file like - signleton, adapter pattern and use full and scalable files codes
for modular code base

3) _complete_ ----------- issues -  HTTP/1.1 cached work but - not send updated record of user


4) _Complete_ ------- Multi-devices messages tracking system - @gemna.team - PR - 20



New =========== Big Update ============ version 0.0.1 ==> version 2.0.1 date-12/04/2026

1) _complete_ - changes to major bugs and issues and to try to make free runtime errors

2) _complete_ - to implement global error handlers 

3) _complete_ - To Add winston logger and Open telementry and observer to log all activities and gracefull response if occurs any error

4) Update by - Saurabh Sharma (@gemna.team.member)



New feature introduction -------------------------- 10/04/26

1) _complete_ - Add Idempotency on remainder to send when user are no enabled the notification setting - 
   old - send email on every messages , that's happen with any user(receiver) 
   updated - only send email on 24 hours periode in onces - so reduce cost per send sending email cost, and memory process, and queue members


2) @gemna.team add new feature that user can delete old messages and edit the message but limiation with edit have to edit only 2 hours old messages according to sending timestamp --------- policy of the gemna auth service(GAS);

3) _fix-issues_ when new user are connected (redis new entry) that trigger the online button 
4) _fix-issues_ typing indication are not worl proper - (id finding issues)

5) _new-redis-add-vercel_  - new KV store on vercel(internal service)

