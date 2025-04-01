# assignment-3

Here are notes and todos for assignment 3.

## Notes

1. Please use `a3: {feature}` as git commit message.  
   We don't enforce a guideline like `feat` / `fix` / `chore` because things are simple here, but please add the `a3` prefix to distinguish commits from previous commits in this repo.

2. We'll work on this assignment asynchronously. To minimize merge conflicts, let's try not to work on the same file at the same time.  
   Normally this shouldn't really happen after charles finishes the initial setup.

3. We'll work on the report together.  
   We'll write it in markdown and convert it to PDF (see [assignment-2](../assignment-2/Report.MD) for reference).

4. I used a `src` folder for common practice. I don't think the structure listed in assignment instruction is good, but we may adjust the structure on submission (remember to change DB path).

## TODOs

Please mark as done by turning `[ ]` into `[x]`. You may pick up unclaimed work (i.e. no @ handle in brackets) and add credits.

This is only the *main* todos, i.e. it's not broken down to specific sub-features. You may add sub-features to the list, or just work on them as a whole and mark the main feature as done.

*There may be missing todos and you may add them as well (and also communicate about the add!)*

### Initial Setup

- [x] transition from a2 / basic setup (@charles)

- [x] file structure (js and images folder) (@charles)

- [x] db schema and setup (@charles)

- [x] authentication (@charles)

### Actual Website

- [x] Student Features

- [ ] Instructor Features

- Note: We may want to hard-code the data for markGroups (i.e. assignments/exams etc) in `app.py` (I used a database table for "generalization" purpose).  
  We may also want to add some dummy `marks` for the default students so they won't see "No marks available" when they login.

### Clean up

- [ ] Testing (Database + Features)

- [ ] Report

- [ ] Final check before submission