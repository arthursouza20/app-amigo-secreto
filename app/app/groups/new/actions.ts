'use server'

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Resend } from "resend";

export type CreateGroupState = {
    success: null | boolean;
    message?: string;
};

export async function createGroup(_previousState: CreateGroupState, formData: FormData) {
    const supabase = await createClient();

    const { data: authUser, error: authError } = await supabase.auth.getUser();

    if (authError) {
        return {
            success: false,
            message: "Ocorreu um erro ao criar o grupo",
        };
    }

    const names = formData.getAll("name");
    const emails = formData.getAll("email");
    const groupsNameArray = formData.getAll("groupName");
    const groupsName = groupsNameArray.length > 0 ? groupsNameArray[0] : null;

    const { data: newGroup, error } = await supabase.from("groups").insert({
        name: groupsName,
        owner_id: authUser?.user.id,
    }).select().single();

    if (error) {
        return {
            success: false,
            message: "Ocorreu um erro ao criar o grupo. Por favor tente novamente ou se o erro persistir, entre em contato com o suporte."
        }
    }

    const participants = names.map((name, index) => ({
        group_id: newGroup.id,
        name,
        email: emails[index]
    }));

    //Adiciona os participantes
    const { data: createdParticipants, error: errorParticipants } = await supabase.from("participants").insert(participants).select();

    if (errorParticipants) {
        return {
            success: false,
            message: "Ocorreu um erro ao adicionar o(s) participante(s) ao grupo. Por favor tente novamente ou se o erro persistir, entre em contato com o suporte."
        };
    }

    //Sorteio dos participantes
    const drawnParticipants = drawGroup(createdParticipants);

    const { error: errorDraw } = await supabase.from("participants").upsert(drawnParticipants);

    if (errorDraw) {
        return {
            success: false,
            message: "Ocorreu um erro ao sortear os participantes do grupo. Por favor tente novamente ou se o erro persistir, entre em contato com o suporte."
        };
    }

    const { error: errorResend } = (await sendEmailToParticipants(drawnParticipants, groupsName as string)) || {};

    if (errorResend) {
        return {
            success: false,
            message: errorResend,
        };
    }



    redirect(`/app/groups/${newGroup.id}`)
}

type Participant = {
    id: string;
    group_id: string;
    name: string;
    email: string;
    assigned_to: string | null;
    created_at: string;
};

function drawGroup(participants: Participant[]) {
    const selectedParticipants: string[] = [];

    return participants.map((participant) => {
        const availableParticipants = participants.filter(
            (p) => p.id !== participant.id && !selectedParticipants.includes(p.id)
        )

        const assignedParticipant = availableParticipants[
            Math.floor(Math.random() * availableParticipants.length)
        ]

        selectedParticipants.push(assignedParticipant.id);

        return {
            ...participant,
            assigned_to: assignedParticipant.id,
        };
    });

}

async function sendEmailToParticipants(participants: Participant[], groupsName: string) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        await Promise.all(
            participants.map(participant => {
                resend.emails.send({
                    from: "email@empresa.com",
                    to: participant.email,
                    subject: `Sorteio de Amigo Secreto - ${groupsName}`,
                    html: `<p>Você está participando do amigo secreto do grupo "${groupsName}". <br/><br/>
                    O seu amigo secreto é <strong>"${participants.find(p => p.id === participant.assigned_to)?.name}"</strong>!</p>`,
                })
            })
        )
    } catch (err) {
        return { error: "Ocorreu um erro ao enviar os emails." }
    }
}