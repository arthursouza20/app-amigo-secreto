"use client";

import { useActionState, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader, Mail, Plus, Trash2 } from "lucide-react";
import { Separator } from "./ui/separator";
import { createGroup, CreateGroupState } from "@/app/app/groups/new/actions";
import { useToast } from "@/hooks/use-toast";


interface Participant {
    name: string;
    email: string;
}


export default function NewGroupForm({ loggedUser, }: { loggedUser: { email: string; id: string } }) {
    const [participants, setParticipants] = useState<Participant[]>([
        { name: "", email: loggedUser.email },
    ]);

    const { toast } = useToast();

    const [groupName, setGroupName] = useState("");

    const [state, formAction, pending] = useActionState<CreateGroupState, FormData>(createGroup, {
        success: null,
        message: "",
    });

    function updateParticipant(index: number, field: keyof Participant, value: string) {
        const updatedParticipants = [...participants]; //cópia dos participantes
        updatedParticipants[index][field] = value; //atualiza o valor do index
        setParticipants(updatedParticipants)
    }

    function removeParticipant(index: number) {
        setParticipants(participants.filter((_, i) => i !== index));
    }

    function createParticipant() {
        setParticipants(participants.concat({ name: "", email: "" }));
    }

    useEffect(() => {
        if (state.success === false) {
            toast({
                variant: "destructive",
                description: state.message,
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);


    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="w-full max-w-2xl mx-auto">
                <CardTitle>Novo Grupo</CardTitle>
                <CardDescription>Adicione os seus amigos para participar</CardDescription>
            </CardHeader>
            <form action={formAction}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="groupName">Nome do grupo</Label>
                        <Input
                            id="groupName"
                            name="groupName"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Digite o nome do grupo"
                            required />

                    </div>

                    <h2 className="!mt-12">Paricipantes</h2>
                    {participants.map((participant, index) => (
                        <div key={index} className="flex flex-col md:flex-row items-end space-y-4 md:space-y-0 md:space-x-4">
                            <div className="flex-grow space-y-2 w-full">
                                <Label htmlFor={`name-${index}`}>Nome</Label>
                                <Input
                                    id={`name-${index}`}
                                    name="name"
                                    value={participant.name}
                                    placeholder="Digite o nome do participante"
                                    onChange={(e) => { updateParticipant(index, "name", e.target.value) }} />
                            </div>
                            <div className="flex-grow space-y-2 w-full">
                                <Label htmlFor={`email-${index}`}>E-mail</Label>
                                <Input
                                    id={`email-${index}`}
                                    name="email"
                                    type="email"
                                    value={participant.email}
                                    placeholder="Digite o email do participante"
                                    onChange={(e) => { updateParticipant(index, "email", e.target.value) }}
                                    className="readonly:text-muted-foreground"
                                    readOnly={participant.email === loggedUser.email}
                                    required />
                            </div>
                            <div className="min-w-9">
                                {participants.length > 1 && participant.email !== loggedUser.email && (
                                    <Button type="button" variant="outline" size="icon" onClick={() => removeParticipant(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}

                </CardContent>

                <Separator className="my-4" />

                <CardFooter className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
                    <Button type="button" variant="outline" onClick={createParticipant} className="w-full md:w-auto">
                        <Plus /> Adicionar participante</Button>
                    <Button type="submit" className="flex items-center space-x-2 w-full md:w-auto">
                        <Mail className="w-3 h-3" /> Criar grupo e enviar emails
                        {pending && <div className="flex items-center justify-center"> <Loader className="animate-spin" /></div>}
                    </Button>

                </CardFooter>

            </form>
        </Card>
    )

}