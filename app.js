const express = require('express');
const mongoose = require('mongoose');
const path = require('path')
const bodyParser = require('body-parser');
const engine = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const localStratergy = require('passport-local');
const nodemailer = require('nodemailer');
const { catchAsync } = require('./ErrorHandler/catchAsync')
const errorHandler = require('./ErrorHandler/errorHandler')
const { validateMovie, isLoggedIn } = require('./middleware/middleware')
const { response } = require('./API/news');
const Movies = require('./models/movies');
const Showtime = require('./models/Showtime');
const Ticket = require('./models/ticket');
const Seats = require('./models/seats');
const user = require('./models/user');
const { type } = require('./Schema/Schema');

let tempMovie = {
    movie: null,
    showtime: null,
    qty: null,
    buyer: null,
}

const app = express();
app.engine('ejs', engine);
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

const sessionInfo = {
    secret: 'P@r!N',
    resave: false,
    saveUninitialized: true,
    cookie: {

        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60,
        maxAge: 1000 * 60 * 60
    }
}
app.use(session(sessionInfo))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStratergy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'parinpatel173@gmail.com',
        pass: '3Cfe170c$'
    }
});

app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

mongoose.connect('mongodb://localhost:27017/MovieApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


mongoose.connection.on('error', console.error.bind(console, 'connection error for database'));
mongoose.connection.once('open', function () {
    console.log('We are connected to database')
});

app.get('/register', (req, res) => {
    res.render('Register')
})

app.post('/register', catchAsync(async (req, res) => {
    const { firstName, lastName, email, username } = req.body;
    const newUser = new user({ firstName, lastName, email, username });
    const registerUser = await user.register(newUser, req.body.password);
    req.login(registerUser, (err) => {
        if (err) {
            next(err);
        } else {
            req.flash('success', 'Successfully Register user!')
            res.redirect('/movies')
        }
    })

}))

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), catchAsync(async (req, res) => {
    req.flash('success', 'Successfully login! Welcome back.')
    const goTo = req.session.returnTo || '/movies';
    res.redirect(goTo)
}))

app.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Successfully logout!')
    res.redirect('/login');
})

app.get('/movies', catchAsync(async (req, res) => {
    const news = await response();
    const movies = await Movies.find();
    res.render('Movies', { news, movies })
}))

app.get('/movies/all', catchAsync(async (req, res) => {
    const movies = await Movies.find().populate('user');
    res.render('AllMovies', { movies })
}))

app.get('/movies/new', isLoggedIn, catchAsync(async (req, res) => {
    const showTimes = await Showtime.find({});
    res.render('NewMovie', { showTimes })
}))

app.post('/movies', isLoggedIn, catchAsync(async (req, res) => {

    const { imgUrl } = req.body;
    const extension = imgUrl.split('.').pop().toLowerCase();

    if (extension == "jpeg" || extension == "jpg" || extension == "png" || extension == "bmp" || extension == "gif") {

        const movie = new Movies(req.body);
        await movie.save();
        req.flash('success', 'Movie created successfully!')
        res.redirect('/movies');
    } else {
        res.redirect('/movies')
    }
}))

app.post('/movies/search', catchAsync(async (req, res) => {
    const { Search } = req.body;
    const movie = await Movies.findOne({ 'title': Search })
    res.redirect(`/movies/${movie._id}`)
}))

app.get('/movies/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const movie = await Movies.findById(id).populate('showtime');

    res.render('About', { movie })
}))


app.get('/movies/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const arr = [];
    const arr1 = [];
    const movie = await Movies.findById(id).populate('showtime');
    const showTimes = await Showtime.find({});
    for (m of movie.showtime) {
        arr.push(m._id.toString());
    }
    for (m of showTimes) {
        arr1.push(m._id.toString());
    }

    res.render('EditForm', { arr, arr1, showTimes, movie });
}))

app.post('/movies/:id/ticketBook', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const seatOccupation = [];
    const currentMovie = await Movies.findById(id);
    const allTickets = await Ticket.find({ movie: `${id}` });
    const qty = req.body.Tickets;
    for (ticket of allTickets) {
        const str = ticket.seat.toString().concat(ticket.row);
        seatOccupation.push(str);
    }
    tempMovie.movie = currentMovie._id;
    tempMovie.showtime = req.body.Show;
    tempMovie.qty = qty;
    tempMovie.buyer = req.user._id;

    return res.render('SeatBook', { seatOccupation, id, qty });
}))

app.post('/movies/:id/seatBook', isLoggedIn, catchAsync(async (req, res) => {

    const { id } = req.params;
    const seatOccupation = [];
    const seatCheck = [];
    const currentMovie = await Movies.findById(id);
    const allTickets = await Ticket.find();
    const currentShow = await Showtime.findById(tempMovie.showtime);
    const movies = await Movies.find();
    const seats = req.body.seat;


    const validation = /^([A-H])([1-9])$/
    if (typeof (seats) == 'string') {

        if (seats.length == 2 && (validation.test(seats))) {
            for (ticket of allTickets) {

                if (currentMovie._id.equals(ticket.movie) && (ticket.seat == seats[0] && ticket.row == seats[1])) {

                    seatOccupation.push(true)

                } else {

                    seatOccupation.push(false)
                }
            }

            function checkSeat(seat) {
                return seat == true;
            }

            if (seatOccupation.some(checkSeat)) {
                req.flash('error', 'Seat is already occupied.')
                return res.redirect(`/movies/${id}`);
            } else {
                seatCheck.push(seats);
                const ticket = new Ticket({
                    movie: tempMovie.movie,
                    showtime: tempMovie.showtime,
                    qty: tempMovie.qty,
                    buyer: tempMovie.buyer,
                    seat: seats[1],
                    row: seats[0]
                })

                ticket.save();

            }
        }

    } else {
        for (seat of seats) {


            if (seat.length == 2 && (validation.test(seat))) {
                for (ticket of allTickets) {


                    if (currentMovie._id.equals(ticket.movie) && (ticket.seat == seat[0] && ticket.row == seat[1])) {
                        seatOccupation.push(true)
                        console.log(seatOccupation)
                    } else {

                        seatOccupation.push(false)
                    }
                }

                function checkSeat(seat) {
                    return seat == true;
                }

                if (seatOccupation.some(checkSeat)) {
                    req.flash('error', 'Seat is already occupied.')
                    return res.redirect(`/movies/${id}`);
                } else {
                    seatCheck.push(seat);
                    const ticket = new Ticket({
                        movie: tempMovie.movie,
                        showtime: tempMovie.showtime,
                        qty: tempMovie.qty,
                        buyer: tempMovie.buyer,
                        seat: seat[1],
                        row: seat[0]
                    })

                    ticket.save();

                }
            }

        }
    }
    const equals = (a, b) => JSON.stringify(a) === JSON.stringify(b);


    if (equals(seats, seatCheck) || seatCheck.includes(seats)) {
        const mailOptions = {
            from: 'parinpatel248@gmail.com',
            to: req.user.email,
            subject: 'Ticket confirmation',
            text: `Your tickets are booked. This is confirmation mail. Please do not reply to this mail.
         \n Movie - ${currentMovie.title}
         \n Show time - ${currentShow.show}
         \n Screen - ${currentShow.screen}
         \n Number of tickets - ${tempMovie.qty}
         \n  Seat Number - ${seats}
         \n\nIf this confirmation is not correct please call on this number 613-853-8560.`

        };
        await transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {

                console.log('Email sent: ' + info.response);
                return res.render('Confirmation', { movies });
            }
        });
    }
    else {
        req.flash('error', 'few Seats are already occupied.')
        return res.redirect(`/movies/${id}`);
    }

}))
app.patch('/movies/:id', isLoggedIn, catchAsync(async (req, res) => {

    const { id } = req.params;
    const { imgUrl } = req.body;
    const extension = imgUrl.split('.').pop().toLowerCase();

    if (extension == "jpeg" || extension == "jpg" || extension == "png" || extension == "bmp" || extension == "gif") {

        const movie = await Movies.findByIdAndUpdate(id, req.body);
        req.flash('success', 'Movie updated successfully!')
        res.redirect('/movies/all')

    } else {
        res.redirect('/movies/all')
    }
}))

app.delete('/movies/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const movie = await Movies.findByIdAndDelete(id);
    req.flash('error', 'Movie deleted successfully!')
    res.redirect('/movies/all')
}))


app.get('/show', isLoggedIn, (req, res) => {
    res.render('NewShow');
})

app.post('/show', isLoggedIn, catchAsync(async (req, res) => {
    const showTime = req.body.show;
    const screen = req.body.screen;
    const showtimevalidation = /^([0-9]{1,2})\:([0-9]{2})([A-Z]{2})$/
    const screenvalidation = /^([0-9])\-([A-F])$/
    if (showtimevalidation.test(showTime)) {
        if (screenvalidation.test(screen)) {
            const show = new Showtime(req.body);
            req.flash('success', 'Show created successfully!')
            show.save();
        }
    }
    res.redirect('/movies')
}))

app.get('/history', catchAsync(async (req, res) => {
    const movieHistory = [];
    const allTickets = await Ticket.find().populate('movie').populate('buyer').populate('showtime');
    for (ticket of allTickets)
        if (ticket.buyer._id.equals(req.user._id)) {
            movieHistory.push(ticket);
        }
    res.render('History', { movie })
}))


app.all('*', (req, res) => {
    res.render('NotFound');
})


app.use((err, req, res, next) => {
    const { message, status } = err;
    res.render('Error', { status, message });
})


app.listen(3000, () => {
    console.log('Connected to PORT')
})