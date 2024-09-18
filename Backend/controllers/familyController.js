const { PrismaClient } = require('@prisma/client');
const yup = require('yup');
const validator = require('validator');
const prisma = new PrismaClient();

// Define the validation schema
const addFamilyMemberSchema = yup.object({
    memberEmail: yup.string().email().required(),
    relation: yup.string().required(),
    aadharNumber: yup.string().matches(/^\d{4}-\d{4}-\d{4}$/, 'Invalid Aadhar number format').required(),
});

exports.addFamilyMember = async (req, res) => {
    const { memberEmail, relation, aadharNumber } = req.body;
    const { userId } = req.user;

    try {
        // Validate request body
        await addFamilyMemberSchema.validate({ memberEmail, relation, aadharNumber });

        // Sanitize input
        const sanitizedMemberEmail = validator.normalizeEmail(memberEmail);
        const sanitizedRelation = validator.escape(relation);
        const sanitizedAadharNumber = validator.escape(aadharNumber);

        const member = await prisma.user.findUnique({
            where: { email: sanitizedMemberEmail }
        });

        if (!member) {
            return res.status(404).json({ error: 'Family member not found' });
        }

        // Create the family member record
        const familyMember = await prisma.familyMember.create({
            data: {
                owner: { connect: { id: userId } },
                member: { connect: { id: member.id } },
                relation: sanitizedRelation,
                aadharNumber: sanitizedAadharNumber,
            },
        });

        res.status(201).json({ message: 'Family member added successfully', familyMember });
    } catch (error) {
        console.error('Error adding family member:', error);
        res.status(500).json({ error: 'Error adding family member', details: error.message });
    }
};

const checkInFamilySchema = yup.object({
    familyMemberIds: yup.array().of(yup.number().integer().positive()).required(),
    aadharNumbers: yup.array().of(yup.string().matches(/^\d{4}-\d{4}-\d{4}$/, 'Invalid Aadhar number format')).required(),
});

exports.checkInFamily = async (req, res) => {
    const { familyMemberIds, aadharNumbers } = req.body;

    try {
        // Validate request body
        await checkInFamilySchema.validate({ familyMemberIds, aadharNumbers });

        if (familyMemberIds.length !== aadharNumbers.length) {
            return res.status(400).json({ error: 'Mismatched family member IDs and Aadhar numbers' });
        }

        // Update each family member's Aadhar number
        for (let i = 0; i < familyMemberIds.length; i++) {
            const familyMember = await prisma.familyMember.findUnique({
                where: { id: familyMemberIds[i] }
            });

            if (!familyMember) {
                return res.status(404).json({ error: `Family member with ID ${familyMemberIds[i]} not found` });
            }

            await prisma.familyMember.update({
                where: { id: familyMemberIds[i] },
                data: { aadharNumber: aadharNumbers[i] }
            });
        }

        res.status(200).json({ message: 'Family members checked in successfully' });
    } catch (error) {
        console.error('Error during check-in:', error);
        res.status(500).json({ error: 'Error during check-in', details: error.message });
    }
};