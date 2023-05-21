const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");

const { body, validationResult } = require("express-validator");
const asyncHandler = require('express-async-handler')


// Display list of all BookInstances.
exports.bookinstance_list = (req, res) => {
    BookInstance.find()
    .populate("book")
    .exec((err, list_bookinstances) => {
        if (err) {
            return next(err);
        }
        // Successful, so render
        res.render("bookinstance_list", {
            title: "Book Instance List",
            bookinstance_list: list_bookinstances,
        });
    });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = (req, res) => {
    BookInstance.findById(req.params.id)
    .populate("book")
    .exec((err, bookinstance) => {
        if (err) {
            return next(err);
        }
        if (bookinstance == null) {
            const err = new Error("Book copy not found");
            err.status = 404;
            return next(err);
        }
        // Successful so render
        res.render("bookinstance_detail", {
            title: `Copy: ${bookinstance.book.title}`,
            bookinstance,
        });
    }); 
};


// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
    const allBooks = await Book.find({}, "title").exec();

    res.render("bookinstance_form", {
        title: "Create BookInstance",
        book_list: allBooks,
    });
});

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
    // Validate and sanitize fields.
    body("book", "Book must be specified").trim().isLength({ min: 1}).escape(),
    body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1})
    .escape(),
    body("status").escape(),
    body("due_back", "Invalid date")
    .optional ({ checkFalsy: true})
    .isISO8601()
    .toDate(),

    // Process requst after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstane object with escaped and trimmed data.
        const bookInstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
        });

        if (!errors.isEmpty()) {
            // There are errors.
            // Render form again with sanitized values and error messages.
            const allBooks = await Book.find({}, "title").exec();

            res.render("bookinstance_form", {
                title: "Create BookInstance",
                book_list: allBooks,
                selected_book: bookInstance.book._id,
                errors: errors.array(),
                bookinstane: bookInstance,
            });
            return;
        } else {
            // Data from form is vlid
            await bookInstance.save();
            res.redirect(bookInstance.url)
        }
    }),
];
// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {  
    const bookinstance = await BookInstance.findById(req.params.id).populate("book")
    res.render("bookinstance_delete", {
        title: "Delete BookInstance",
        bookinstance: bookinstance,
    })
})


// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
    await BookInstance.findByIdAndDelete(req.body.bookinstanceid);
    res.redirect('/catalog/bookinstances')
})

// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
    const [bookinstance, allBooks] = await Promise.all([
        BookInstance.findById(req.params.id).exec(),
        Book.find({}, "title").exec(),])

    if (bookinstance === null) {
        // No results.
        const err = new Error("Book not found");
        err.status = 404;
        return next(err);
    }

    res.render("bookinstance_form", {
        title: "Update Book",
        book_list: allBooks,
        bookinstance: bookinstance,
    })
}) 

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
    body("book", "Book must be specified").trim().isLength({ min: 1}).escape(),
    body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1})
    .escape(),
    body("status").escape(),
    body("due_back", "Invalid date")
    .optional ({ checkFalsy: true})
    .isISO8601()
    .toDate(),

    // Process request after validation and sanitization.
    asyncHandler(async(req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Update a bookinstance object wit escaped/trimmed data and old id.
        const bookInstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
            _id: req.params.id, // This is required, or a new ID will be asigned!
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            const allBooks = await Book.find({}, "title").exec();

            res.render("bookinstance_form", {
                title: "Update BookInstance",
                book_list: allBooks,
                bookinstance: bookInstance,
                errors: errors.array(),
            });
            return;
        } else {
            // Data from form is valid. Update the record.
            const updateBookInstance = await BookInstance.findByIdAndUpdate(req.params.id, bookInstance, {});
            // Redirect to bookinstance detail page.
            res.redirect(updateBookInstance.url);
        }
    })
];


