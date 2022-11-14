import express from 'express';
import controller from '../controllers/Player';

const router = express.Router();

router.post('/create', controller.createPlayer);
router.post('/signin', controller.signIn);
router.get('/get/:username', controller.readPlayer);
router.get('/get/', controller.readAll);
router.patch('/update/:playerId', controller.updatePlayer);
router.patch('/updateElo/:playerId', controller.updatePlayerElo);
router.delete('/delete/:playerId', controller.deletePlayer);
router.post('/password-reset', controller.passwordResetLink);
router.post('/password-reset/:userId/:token', controller.passwordReset);

export = router;
