const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  exposedHeaders: ['set-cookie'],
  preflightContinue: true
}));

app.use(express.json());
app.use(cookieParser());

const customTripsRouter = require('./routes/customTrips');
app.use('/api/custom-trips', customTripsRouter);

const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);

const financesRouter = require('./routes/finances');
app.use('/api/finances', financesRouter);

const paymentRoutes = require('./routes/payments');
app.use('/api/payments', paymentRoutes);