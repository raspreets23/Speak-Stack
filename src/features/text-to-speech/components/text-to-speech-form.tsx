"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formOptions } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { useAppForm } from "@/hooks/use-app-form";

const ttsFormSchema = z.object({
  text: z.string().min(1, "Please enter some text"),
  voiceId: z.string().min(1, "Please select a voice"),
  temperature: z.number(),
  topP: z.number(),
  topK: z.number(),
  repetitionPenalty: z.number(),
});

export type TTSFormValues = z.infer<typeof ttsFormSchema>;

export const defaultTTSValues: TTSFormValues = {
  text: "",
  voiceId: "",
  temperature: 0.8,
  topP: 0.95,
  topK: 1000,
  repetitionPenalty: 1.2,
};

export const ttsFormOptions = formOptions({
  defaultValues: defaultTTSValues,
});

export function TextToSpeechForm({
  children,
  defaultValues,
}: {
  children: React.ReactNode;
  defaultValues?: TTSFormValues;
}) {
  console.log("🔵 [FORM] TextToSpeechForm rendering");

  const trpc = useTRPC();
  console.log("🔵 [FORM] trpc available:", !!trpc);
  
  const router = useRouter();
  const createMutation = useMutation(
    trpc.generations.create.mutationOptions({}),
  );
  console.log("🔵 [FORM] createMutation created");

  const form = useAppForm({
    ...ttsFormOptions,
    defaultValues: defaultValues ?? defaultTTSValues,
    validators: {
      onSubmit: ttsFormSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("🔵 [FORM] 🔥🔥🔥 FORM SUBMITTED! Value:", value);
      console.log("🔵 [FORM] Text length:", value.text.trim().length);
      console.log("🔵 [FORM] Voice ID:", value.voiceId);
      console.log("🔵 [FORM] Temperature:", value.temperature);
      
      try {
        console.log("🔵 [FORM] Calling createMutation.mutateAsync...");
        const data = await createMutation.mutateAsync({
          text: value.text.trim(),
          voiceId: value.voiceId,
          temperature: value.temperature,
          topP: value.topP,
          topK: value.topK,
          repetitionPenalty: value.repetitionPenalty,
        });
        console.log("🔵 [FORM] ✅ Mutation successful! Data:", data);
        console.log("🔵 [FORM] Redirecting to:", `/text-to-speech/${data.id}`);
        toast.success("Audio generated successfully!");
        router.push(`/text-to-speech/${data.id}`);
      } catch (error) {
        console.error("🔴 [FORM] ❌ Mutation failed:", error);
        const message =
          error instanceof Error ? error.message : "Failed to generate audio";
        toast.error(message);
      }
    },
  });

  console.log("🔵 [FORM] Form object created, handleSubmit exists:", !!form.handleSubmit);
  console.log("🔵 [FORM] form.AppForm exists:", !!form.AppForm);

  return <form.AppForm>{children}</form.AppForm>;
}