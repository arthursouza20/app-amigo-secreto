"use client";

import { useActionState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { login, LoginState } from "@/app/(auth)/login/actions";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Loader, MessageCircle } from "lucide-react";

export function LoginForm() {
    const [state, formAction, pending] = useActionState<LoginState, FormData>(
        login,
        {
            success: null,
            message: "",
        }
    );

    return (
        <Card className="mx-auto max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>
                    Digite seu e-mail para receber o link mágico
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form action={formAction}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Nome</Label>
                            <Input id="text" type="name" name="name" placeholder="Seu nome" required />
                            <Label>E-mail</Label>
                            <Input id="email" type="email" name="email" placeholder="amigo@email.com" required />

                        </div>

                        {state.success === true && (
                            <Alert className="text-muted-foreground">
                                <MessageCircle className="h-4 w-4 !text-green-600" />
                                <AlertTitle> E-mail enviado!</AlertTitle>
                                <AlertDescription>Confira seu email para acessar o link de login</AlertDescription>
                            </Alert>
                        )}

                        {state.success === false && (
                            <Alert className="text-muted-foreground">
                                <MessageCircle className="h-4 w-4 !text-red-600" />
                                <AlertTitle> Erro!</AlertTitle>
                                <AlertDescription>Ocorreu um erro ao enviar o link de login. Por favor, entre em contato com o suporte!</AlertDescription>
                            </Alert>
                        )}

                        <Button type="submit" className="w-full">Login</Button>

                        {pending && <div className="flex items-center justify-center"> <Loader className="animate-spin" /></div>}
                    </div>
                </form>
            </CardContent>

        </Card>
    )
}