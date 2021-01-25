const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const emailRegex = new RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$");

exports.signup = (req, res, next) => {
    if (!req.body.password || !emailRegex.test(req.body.email)) {
        return res.status(400).json({ error: 'Format incorrect !' });
    }
    if (req.body.password.length < 4) {
        return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 4 caractères !' });
    }
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    if (!req.body.password || !emailRegex.test(req.body.email)) {
        return res.status(400).json({ error: 'Format incorrect !' });
    }
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: 'Utilisateur non trouvé !' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign({ userId: user._id },
                            'NOT_A_SECRET_ENOUGH_TOKEN_FOR_PROD', { expiresIn: '24h' }
                        )
                    });
                })

            .catch(error => {
                    console.log(error);
                    res.status(501).json({ error });
                }

            );
        })
        .catch(error => res.status(500).json({ error }));
};