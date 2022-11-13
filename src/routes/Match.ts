import express from 'express';
import controller from '../controllers/Match';

const router = express.Router();

router.post('/create', controller.createMatch);
router.get('/getmymatches/:userid', controller.readAllMyMatches);
router.get('/get/:matchId', controller.readMatch);
router.get('/get/', controller.readAll);
router.patch('/update/:matchId', controller.updateMatch);
router.delete('/delete/:matchId', controller.deleteMatch);

export = router;
