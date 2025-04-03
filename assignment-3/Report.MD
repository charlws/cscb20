---
geometry: margin=1in
---

# Report

## What we've done

Everything required, from authentication to student and instructor features. We only designed extra to make it like an actual website, while we did not complete everything we desired (which was out-of-scope) due to lack of time.

## What we've struggled with

Not really anything due to the presence of @CharlesWithC. We'll talk about that in the #extras section later.

## How's work divided

Charles did most of the (normal and crazy) work due to experience, while Omar started out new functions while playing with the code.

## Any extra features added

1. RESTful API  
   We designed an API-based backend so that user interactions can be made through ajax calls, without the need of a full-page reload. This includes entering marks, editing marks, submitting and managing remark requests etc. We utilized 'modals' quite a bit, which allows us to stuff a lot of functions into a single page.

2. The Design  
   We designed the website to be like a real course website, more than an assignment submission. The most noticable feature is `MarkGroup` table in db schema, where you create the evaluations that marks will be linked to. It even includes a `releasedAt` attribute, which was not fully utilized in this submission (because there was no "write" functionality client-side), but our predefined database includes some `Not yet released` evaluations that can be seen by the student.

3. Modularization  
   This is not a client-side feature, but a code-level feature. You may have noticed a `components` folder under `templates` folder, where we placed definitions of `macros`, which are essentially reusable components in `Flask/Jinja2`. This removes the necessity of duplicating code for the same feature on different pages.

4. And probably more...  
   A powerful table for displaying student marks and regrade requests, with inline links to modals for extra actions, and filtering for evaluation and student.  
   Ability to modify or delete student marks, in addition to entering marks - we know mistakes could happen!  
   JSON-based feedback form, which allows flexible question formats and future changes to the questions.  
   Refined UI based on Assignment 2, with full dark-mode support to all elements, including input and select boxes.  
   ...  
   There's a lot more that can be done, since we left quite some placeholding functions/attributes for future integrations, but that's it for now, the submission for Assignment 3.

## Enjoy~

![Purva Gawde](./src/static/images/purva.png)