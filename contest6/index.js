const express = require('express')
const z = require("zod")
const app = express();
app.use(express.json());


const db= {
    users: [
        {
            id:1,
            username:"rahul_gujjar",
            password:"pass123",
            email:"rahul@example.com",
            token:null,
            bookings: [
                {
                    bookingId:1001,
                    movieId:1,
                    showId:102,
                    seats:3,
                    totalAmount:750,
                    status:"confirmed",
                    bookingDate:"2026-06-18"
                }
            ]
        }
    ],
    movies: [
        {
      id:1,
      title:"Inception",
      genre:"Sci-Fi",
      duration:148,
      shows: [
        {
          showId:101,
          time:"10:00 AM",
          pricePerSeat:200,
          availableSeats:50
        },
        {
          showId:102,
          time:"2:00 PM",
          pricePerSeat:250,
          availableSeats:50
        },
        {
          showId:103,
          time:"6:00 PM",
          pricePerSeat:300,
          availableSeats:50
        }
      ]
    },
    {
      id:2,
      title:"The Dark Knight",
      genre:"Action",
      duration:152,
      shows: [
        {
          showId:201,
          time:"11:00 AM",
          pricePerSeat:200,
          availableSeats:50
        },
        {
          showId:202,
          time:"3:00 PM",
          pricePerSeat:250,
          availableSeats:50
        },
        {
          showId:203,
          time:"7:00 PM",
          pricePerSeat:300,
          availableSeats:50
        }
      ]
    },
    {
      id:3,
      title:"Interstellar",
      genre:"Sci-Fi",
      duration:169,
      shows: [
        {
          showId:301,
          time:"12:00 PM",
          pricePerSeat:250,
          availableSeats:50
        },
        {
          showId:302,
          time:"5:00 PM",
          pricePerSeat:300,
          availableSeats:50
        }
      ]
    }
  ]
}

const userSignupSchema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6)
})


app.post("/signup", (req, res) => {

    const result = userSignupSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid inputs"
        });
    }

    const { username, email, password } = result.data;

    const existingUser = db.users.find(
        user => user.email === email
    );

    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "Email already exists"
        });
    }

    const newUser = {
        id: db.users.length + 1,
        username,
        email,
        password,
        token: null,
        bookings: []
    };

    db.users.push(newUser);

    return res.status(201).json({
        success: true,
        message: "User created successfully",
        userId: newUser.id
    });
});

const userSigninSchema = z.object({
    username: z.string(),
    password: z.string()
});

app.post("/signin", (req,res) =>{
    const result = userSigninSchema.safeParse(req.body);

    if(!result.success){
        return res.status(400).json({
            sucess:false,
            message: "false input"
        });
    }

    const { username, password } = result.data;

    const user = db.users.find(
        user => user.username === username
    );

    if(!user){
        return res.status(401).json({
            sucess: false,
            message: "Invalid username or password"
        });
    }

    if (user.password !== password) {
        return res.status(401).json({
            sucess: false,
            message: "INvalid username or password"
        });
    }

    const token = Math.random().toString();

    user.token =token;
    return res.status(200).json({
        sucess: true,
        message: "SignIn sucessfull",
        token
    });
});



app.get("/movies", (req,res) => {
    return res.status(200).json({
        sucess: true,
        movies: db.movies
    });
});

app.get("/movies/:movieId", (req,res) => {
    const movieId = Number(req.params.movieId);

    const movie = db.movies.find(
        movie => movie.id === movieId
    );

    if(!movie){
        return res.status(404).json({
            sucess: false,
            message: "Movie not found"
        });
        
    }

    return res.status(200).json({
        sucess: true,
        movie
    });

});

app.get("/movies/:movieId/shows", (req, res) => {

    const movieId = Number(req.params.movieId);

    const movie = db.movies.find(
        movie => movie.id === movieId
    );

    if (!movie) {
        return res.status(404).json({
            success: false,
            message: "Movie not found"
        });
    }

    return res.status(200).json({
        success: true,
        shows: movie.shows
    });
});

function authMiddleware(req, res, next) {

    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    const user = db.users.find(
        user => user.token === token
    );

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    req.user = user;
    next();
}

const bookingSchema = z.object({
    movieId: z.number(),
    showId: z.number(),
    seats: z.number().min(1)
});

app.post("/bookings/:userId", authMiddleware, (req, res) => {

    const userId = Number(req.params.userId);

    if (req.user.id !== userId) {
        return res.status(403).json({
            success: false,
            message: "Access denied"
        });
    }

    const result = bookingSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid input"
        });
    }

    const { movieId, showId, seats } = result.data;

    const movie = db.movies.find(
        movie => movie.id === movieId
    );

    if (!movie) {
        return res.status(404).json({
            success: false,
            message: "Movie not found"
        });
    }

    const show = movie.shows.find(
        show => show.showId === showId
    );

    if (!show) {
        return res.status(404).json({
            success: false,
            message: "Show not found"
        });
    }

    if (show.availableSeats < seats) {
        return res.status(400).json({
            success: false,
            message: "Not enough seats available"
        });
    }

    let bookingId = 1001;

    req.user.bookings.forEach(booking => {
        if (booking.bookingId >= bookingId) {
            bookingId = booking.bookingId + 1;
        }
    });

    show.availableSeats -= seats;

    const booking = {
        bookingId,
        movieId,
        showId,
        seats,
        totalAmount: seats * show.pricePerSeat,
        status: "confirmed",
        bookingDate: new Date().toISOString().split("T")[0]
    };

    req.user.bookings.push(booking);

    return res.status(201).json({
        success: true,
        message: "Booking successful",
        bookingId,
        movieTitle: movie.title,
        showTime: show.time,
        seats,
        totalAmount: booking.totalAmount
    });
});

app.get("/bookings/:userId", authMiddleware, (req, res) => {

    const userId = Number(req.params.userId);

    if (req.user.id !== userId) {
        return res.status(403).json({
            success: false,
            message: "Access denied"
        });
    }

    return res.json({
        success: true,
        bookings: req.user.bookings
    });
});

app.get("/bookings/:userId/:bookingId", authMiddleware, (req, res) => {

    const userId = Number(req.params.userId);
    const bookingId = Number(req.params.bookingId);

    if (req.user.id !== userId) {
        return res.status(403).json({
            success: false,
            message: "Access denied"
        });
    }

    const booking = req.user.bookings.find(
        booking => booking.bookingId === bookingId
    );

    if (!booking) {
        return res.status(404).json({
            success: false,
            message: "Booking not found"
        });
    }

    return res.json({
        success: true,
        booking
    });
});

app.put("/bookings/:userId/:bookingId", authMiddleware, (req, res) => {

    const userId = Number(req.params.userId);
    const bookingId = Number(req.params.bookingId);
    const seats = Number(req.body.seats);

    const booking = req.user.bookings.find(
        booking => booking.bookingId === bookingId
    );

    if (!booking) {
        return res.status(404).json({
            success: false,
            message: "Booking not found"
        });
    }

    if (booking.status === "cancelled") {
        return res.status(400).json({
            success: false,
            message: "Cannot update cancelled booking"
        });
    }

    if (seats <= booking.seats) {
        return res.status(400).json({
            success: false,
            message: "Cannot reduce seats"
        });
    }

    const movie = db.movies.find(
        movie => movie.id === booking.movieId
    );

    const show = movie.shows.find(
        show => show.showId === booking.showId
    );

    const extraSeats = seats - booking.seats;

    if (show.availableSeats < extraSeats) {
        return res.status(400).json({
            success: false,
            message: "Not enough seats available"
        });
    }

    show.availableSeats -= extraSeats;

    booking.seats = seats;
    booking.totalAmount = seats * show.pricePerSeat;

    return res.json({
        success: true,
        message: "Booking updated successfully",
        bookingId,
        seats: booking.seats,
        totalAmount: booking.totalAmount
    });
});


app.delete("/bookings/:userId/:bookingId", authMiddleware, (req, res) => {

    const bookingId = Number(req.params.bookingId);

    const booking = req.user.bookings.find(
        booking => booking.bookingId === bookingId
    );

    if (!booking) {
        return res.status(404).json({
            success: false,
            message: "Booking not found"
        });
    }

    if (booking.status === "cancelled") {
        return res.status(400).json({
            success: false,
            message: "Booking already cancelled"
        });
    }

    const movie = db.movies.find(
        movie => movie.id === booking.movieId
    );

    const show = movie.shows.find(
        show => show.showId === booking.showId
    );

    show.availableSeats += booking.seats;

    booking.status = "cancelled";

    return res.json({
        success: true,
        message: "Booking cancelled successfully"
    });
});


app.listen(3000, ()=>{
    console.log(`server is running on port ${3000}`)
})
